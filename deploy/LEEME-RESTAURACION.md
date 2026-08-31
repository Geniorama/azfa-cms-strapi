# Respaldos de AZFA — cómo restaurar

Este documento está **sin cifrar a propósito**, para que se pueda leer desde Drive en el
momento en que haga falta. Todo lo demás en esta carpeta **sí está cifrado**.

Última revisión: 31 de agosto de 2026.

---

## Qué hay aquí y cada cuánto se actualiza

| Carpeta | Contenido | Frecuencia | Se conservan |
|---|---|---|---|
| `diario/` | Volcado completo de la base de datos del CMS | **Todos los días**, 03:15 UTC (22:15 en Colombia) | 14 días |
| `medios/` | Copia de todos los ficheros del CMS: imágenes, PDF, vídeos | **Domingos**, incremental | Siempre al día |
| `medios-historico/` | Versiones anteriores de ficheros borrados o reemplazados | Cuando cambia algo | 56 días |
| `semanal/` | Código fuente completo, con todo su historial | **Domingos** | 56 días |

El respaldo lo lanza una tarea programada en el servidor del CMS
(`ec2-34-228-145-249.compute-1.amazonaws.com`). **Los domingos** hace el ciclo completo;
el resto de días, solo la base de datos.

Los lunes a las 08:30 UTC se ejecuta una comprobación automática que descarga el último
respaldo, lo descifra y verifica que se puede restaurar.

---

## ⚠️ Antes de intentar nada: esto está cifrado

Los ficheros de esta unidad **no se pueden usar descargándolos desde el navegador**.
Aunque los nombres se lean, el contenido está cifrado.

Para restaurar hacen falta dos cosas:

1. **`rclone`** instalado — <https://rclone.org/downloads/>
2. **La contraseña de cifrado**, que está en el **gestor de contraseñas del equipo**, bajo
   la entrada de los respaldos de AZFA. No está en este documento ni en esta unidad a
   propósito: si estuviera aquí, el cifrado no serviría de nada.

Si esa contraseña se ha perdido, **estos respaldos no se pueden recuperar**. No hay forma
de saltarse esto.

---

## Preparar el acceso

En cualquier ordenador con `rclone`, crear un fichero de configuración con:

```ini
[drive-azfa]
type = drive
scope = drive
service_account_file = <ruta al JSON de la cuenta de servicio>
team_drive = 0AJA87_jmJAkZUk9PVA

[backup]
type = crypt
remote = drive-azfa:AZFA-Backups
filename_encryption = off
directory_name_encryption = false
password = <resultado de ejecutar: rclone obscure "LA-CONTRASEÑA">
```

El JSON de la cuenta de servicio está en el servidor del CMS, en
`~/.config/rclone/azfa-backups.json`, y también se puede regenerar desde Google Cloud
Console (proyecto `azfa-support`, cuenta `azfa-backups`).

Comprobar que funciona:

```bash
rclone lsd backup:
```

Si lista `diario`, `medios` y `semanal`, ya se puede restaurar.

---

## Restaurar la base de datos

```bash
# 1. Ver los volcados disponibles
rclone lsl backup:diario/

# 2. Descargar el que interese
rclone copy backup:diario/azfa-db-20260831.dump .

# 3. Restaurar sobre la base de datos
pg_restore -h <host-de-rds> -U <usuario> -d <nombre-bd> \
  --clean --if-exists azfa-db-20260831.dump
```

`--clean --if-exists` borra los objetos existentes antes de recrearlos: **sustituye** el
contenido actual. Si se quiere restaurar sobre una base de datos nueva para comparar, se
omite esa opción y se apunta a otra base de datos.

Para comprobar un volcado antes de usarlo, sin restaurar nada:

```bash
pg_restore -l azfa-db-20260831.dump | head -20
```

---

## Restaurar los medios

**Un fichero suelto:**

```bash
rclone copy backup:medios/nombre-del-fichero.pdf .
```

**Un fichero que alguien borró o reemplazó** — las versiones anteriores se guardan por
fecha:

```bash
rclone lsf backup:medios-historico/
rclone copy backup:medios-historico/20260831/nombre-del-fichero.pdf .
```

**Todo el conjunto de vuelta a S3** (solo en caso de pérdida del bucket):

```bash
rclone sync backup:medios s3-azfa:amzn-s3-azfa-strapi
```

> Esto **sobrescribe** el bucket. Antes de lanzarlo conviene confirmar que es lo que se
> quiere: si el bucket está intacto y el respaldo es más antiguo, se perderían los
> ficheros subidos desde el último domingo.

---

## Restaurar el código

```bash
rclone copy backup:semanal/cms-strapi-azfa-20260831.bundle .
git clone cms-strapi-azfa-20260831.bundle cms-strapi-azfa
```

El *bundle* contiene **todas las ramas y todo el historial**, así que el repositorio queda
igual que el original.

El código está además en GitHub (`Geniorama/azfa-cms-strapi` y `Geniorama/azfa-web`); esta
copia existe por si se perdiera el acceso a esa cuenta.

---

## Qué NO está aquí, y por qué importa

**Los ficheros `.env` de los servidores**, que contienen todas las contraseñas y claves de
la plataforma. Se dejaron fuera a propósito: subirlos aquí trasladaría el problema en lugar
de resolverlo.

Esto tiene una consecuencia práctica que conviene tener presente: **con estos respaldos se
recupera el contenido, pero no la configuración**. Si se perdiera un servidor entero habría
que recrear su `.env` a mano, y sin él la base de datos restaurada no arranca. Esos
ficheros deben estar custodiados en el gestor de contraseñas del equipo, igual que la
contraseña de cifrado.

---

## Cómo saber que el respaldo sigue vivo

Un respaldo que deja de ejecutarse no avisa: todo parece correcto hasta el día que hace
falta. Dos formas de comprobarlo:

**Desde Drive, sin herramientas.** Mirar la fecha del fichero más reciente en `diario/`.
Si tiene más de un par de días, algo va mal.

**Desde el servidor, completo:**

```bash
ssh ubuntu@ec2-34-228-145-249.compute-1.amazonaws.com
bash ~/azfa-cms-strapi/deploy/backup-verificar.sh
```

Comprueba que la tarea programada sigue viva, que hay un fichero reciente en Drive, y que
el último volcado se descifra y es restaurable. El registro de ejecuciones está en
`/var/log/azfa-backup.log`.

---

## Documentación técnica

El detalle completo —configuración, decisiones de diseño y resolución de problemas— está en
el repositorio del CMS, en `deploy/BACKUP_DRIVE.md`.
