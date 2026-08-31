# Respaldo automático a Google Drive

> **Estado: en funcionamiento desde el 31 de agosto de 2026.**
> Instancia del CMS (`i-04addd99c5857bc23`) → unidad compartida `EKON7-AZFA`, carpeta
> `AZFA-Backups/`. Cron a diario a las 03:15 UTC, con comprobación los lunes.

Sube a una unidad compartida de Drive, **cifrado**, desde la instancia del CMS:

| Qué | Cuándo | Retención |
|---|---|---|
| Volcado de la base de datos RDS | A diario | 14 días |
| Espejo de los medios de S3 (2 397 objetos, 439 MB) | Semanal, incremental | Versiones anteriores 56 días |
| Código de los repositorios (`git bundle --all`) | Semanal | 56 días |

Scripts: `deploy/backup-drive.sh` y `deploy/backup-verificar.sh`.

---

## Lo que hace falta antes de activarlo

Dos cosas que solo se pueden crear desde las consolas de Google:

### 1. Una cuenta de servicio

En **Google Cloud Console**, con un proyecto cualquiera de la organización:

1. **APIs y servicios → Biblioteca** → habilitar **Google Drive API**.
2. **IAM y administración → Cuentas de servicio** → *Crear cuenta de servicio*.
   Nombre sugerido: `azfa-backups`. No hace falta darle ningún rol de IAM.
3. En la cuenta creada → pestaña **Claves** → *Agregar clave* → **Crear clave nueva** →
   tipo **JSON**. Se descarga un fichero; ese es el que hay que subir al servidor.
4. Copiar la **dirección de correo** de la cuenta de servicio, del estilo
   `azfa-backups@<proyecto>.iam.gserviceaccount.com`.

### 2. Una unidad compartida

En **Google Drive**:

1. Crear una **unidad compartida** (no una carpeta normal), p. ej. `AZFA — Respaldos`.
2. Añadir como miembro la dirección de la cuenta de servicio con el rol
   **Administrador de contenido**.
3. Abrirla y copiar el **ID** de la URL:
   `drive.google.com/drive/folders/`**`0AB...`** ← eso es el ID.

> **Tiene que ser Administrador de contenido, no Colaborador.** Colaborador puede añadir
> ficheros pero **no borrarlos ni moverlos**, y eso rompe dos cosas: la retención —los
> ficheros viejos no se podrían eliminar y la unidad crecería sin límite— y el historial de
> medios, que funciona moviendo las versiones anteriores. El síntoma es un
> `403 insufficientFilePermissions` al borrar. Tampoco hace falta **Administrador**, que
> además dejaría a la cuenta de servicio gestionar los miembros de la unidad.

> **Por qué una unidad compartida y no una carpeta.** Los ficheros que sube una cuenta de
> servicio quedan a su nombre, y una cuenta de servicio **no tiene cuota de almacenamiento
> propia**. En una carpeta normal el respaldo acaba fallando con *storage quota exceeded*
> en cuanto crece. En una unidad compartida el espacio cuenta contra el plan de la
> organización y eso no pasa.

---

## Instalación

Con el JSON de la cuenta de servicio y el ID de la unidad compartida:

```bash
# 1. La clave de la cuenta de servicio, solo legible por su dueño
mkdir -p ~/.config/rclone
# (copiar aquí el JSON como ~/.config/rclone/azfa-backups.json)
chmod 600 ~/.config/rclone/azfa-backups.json

# 2. Generar la contraseña de cifrado y GUARDARLA EN EL GESTOR DE CONTRASEÑAS
openssl rand -base64 32
```

Después, `~/.config/rclone/rclone.conf` (permisos `600`):

```ini
[drive-azfa]
type = drive
scope = drive
service_account_file = /home/ubuntu/.config/rclone/azfa-backups.json
team_drive = <ID DE LA UNIDAD COMPARTIDA>

[s3-azfa]
type = s3
provider = AWS
access_key_id = <AWS_ACCESS_KEY_ID del .env>
secret_access_key = <AWS_SECRET_ACCESS_KEY del .env>
region = us-east-1
# Solo se lee de aquí; el respaldo nunca escribe en el bucket.
#
# OJO: el script apunta a `s3-azfa:amzn-s3-azfa-strapi`, con el bucket
# explícito. Usar `s3-azfa:` a secas hace que rclone intente listar TODOS los
# buckets de la cuenta, lo que exige `s3:ListAllMyBuckets`; el usuario
# `strapi-uploads` no tiene ese permiso —y hace bien, está al mínimo
# privilegio— así que la sincronización fallaría con AccessDenied.

[backup]
type = crypt
remote = drive-azfa:AZFA-Backups
# Nombres legibles, contenido cifrado: se puede navegar la carpeta desde Drive
# sin poder leer nada.
filename_encryption = off
directory_name_encryption = false
password = <resultado de: rclone obscure "LA-CONTRASEÑA-GENERADA">
```

Y activar el cron:

```bash
chmod +x ~/azfa-cms-strapi/deploy/backup-drive.sh
sudo touch /var/log/azfa-backup.log && sudo chown ubuntu /var/log/azfa-backup.log
sudo mkdir -p /var/lib/azfa-backup && sudo chown ubuntu /var/lib/azfa-backup

crontab -e
```

```cron
# Respaldo a Drive, 03:15 UTC (22:15 en Colombia): tráfico mínimo.
# El script decide solo si toca la parte semanal (domingos).
15 3 * * * /bin/bash /home/ubuntu/azfa-cms-strapi/deploy/backup-drive.sh >> /var/log/azfa-backup.log 2>&1

# Comprobación semanal: avisa si el respaldo dejó de ejecutarse o de ser válido.
30 8 * * 1 /bin/bash /home/ubuntu/azfa-cms-strapi/deploy/backup-verificar.sh >> /var/log/azfa-backup.log 2>&1
```

> El servidor está en **UTC**, así que 03:15 UTC son las 22:15 en Colombia.

Primera ejecución manual, forzando también la parte semanal:

```bash
FORZAR_SEMANAL=1 bash ~/azfa-cms-strapi/deploy/backup-drive.sh
```

---

## Cómo saber que sigue funcionando

**Este es el punto que importa.** Un respaldo que deja de ejecutarse no avisa: todo parece
correcto hasta el día que hace falta.

```bash
bash ~/azfa-cms-strapi/deploy/backup-verificar.sh
```

Comprueba tres cosas que fallan de formas distintas:

1. **Que el script se ejecutó** hace menos de 30 h — detecta que el cron murió.
2. **Que hay un fichero reciente en Drive** — detecta que el cron corre pero la subida falla.
3. **Que el último volcado se descifra y es restaurable** — lo descarga y le pasa
   `pg_restore -l`. Es lo único que distingue un respaldo de un fichero cualquiera.

Conviene añadirlo al mantenimiento mensual, y opcionalmente a un cron semanal que envíe su
salida por correo.

---

## Restaurar

```bash
# Base de datos
rclone copy backup:diario/azfa-db-YYYYMMDD.dump .
pg_restore -h <host> -U <usuario> -d <bd> --clean --if-exists azfa-db-YYYYMMDD.dump

# Un fichero de medios suelto
rclone copy backup:medios/<nombre> .

# Una versión anterior de un medio borrado o reemplazado
rclone lsf backup:medios-historico/
rclone copy backup:medios-historico/<fecha>/<nombre> .

# Código
rclone copy backup:semanal/cms-strapi-azfa-YYYYMMDD.bundle .
git clone cms-strapi-azfa-YYYYMMDD.bundle
```

---

## Decisiones de diseño, y por qué

**El espejo de medios usa `--backup-dir`.** Una sincronización a secas es un espejo, no un
respaldo: si alguien borra un medio en el CMS, el borrado se propaga y no queda nada que
recuperar. Con `--backup-dir`, la versión anterior se mueve a `medios-historico/<fecha>` en
lugar de desaparecer.

**Se verifica cada subida.** Que `rclone` no dé error no significa que el fichero esté
completo al otro lado. El script comprueba que existe en el destino y que el tamaño coincide.

**Se comprueba que el volcado es restaurable** con `pg_restore -l` antes de subirlo. Un
`pg_dump` truncado no da error visible.

**El cifrado deja los nombres legibles.** `filename_encryption = off` permite navegar la
carpeta desde Drive y ver qué hay, sin poder leer el contenido. Con los nombres cifrados la
carpeta es opaca incluso para quien la administra, y eso hace la restauración más difícil
justo cuando hay prisa.

---

## Dos avisos importantes

**La contraseña de cifrado tiene que vivir fuera del servidor.** Está en `rclone.conf`, en
la misma máquina que se respalda. Si esa máquina se pierde —que es el escenario para el que
existe el respaldo— y la contraseña no está en ningún otro sitio, **los respaldos son
ilegibles**. Guardarla en el gestor de contraseñas del equipo, hoy, antes de activar el cron.

**Lo que este respaldo NO cubre.** Los ficheros `.env` de las dos instancias, que contienen
todos los secretos, quedan deliberadamente fuera: subirlos a Drive trasladaría el problema
en lugar de resolverlo. Deben custodiarse en el gestor de contraseñas. Si se perdiera una
instancia habría que recrearlos a mano, y sin ellos el volcado de la base de datos no sirve
de mucho — conviene tenerlo previsto.
