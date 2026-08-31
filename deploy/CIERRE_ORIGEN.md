# Cierre del origen tras Cloudflare

**Fecha:** 31 de agosto de 2026
**Contexto:** hallazgo 2.1 del mantenimiento de agosto. Los dos servidores de origen
respondían por su IP pública, saltándose Cloudflare, y el del CMS lo hacía por HTTP sin
cifrar incluido `/admin`.

---

## Estado

| Paso | Servidor | Estado |
|---|---|---|
| 1. TLS de origen en el nginx del CMS | CMS | ✅ **Hecho** — commit `3539c85` |
| 2. Permisos de la clave privada | CMS | ✅ **Hecho** — 644 → 600 |
| 3. Pasar el subdominio a Full (strict) | Cloudflare | ✅ **Hecho y verificado** el 31 ago |
| 4. Redirección 80 → 443 en el CMS | CMS | ✅ **Hecho y verificado** el 31 ago |
| 5. Restringir el security group | AWS | ✅ **Hecho y verificado** el 31 ago |
| 6. Authenticated Origin Pulls | Cloudflare + CMS | ⛔ Requiere el panel |

---

## ⚠️ Lección del paso 3: había DOS certificados y uno no servía

Al activar Full (strict), **el CMS devolvió 526** (Cloudflare no pudo validar el
certificado de origen) durante unos minutos, hasta que se sustituyó el certificado.

La instancia del CMS tenía un Origin CA emitido el **15 oct 2025**, y el front otro
distinto emitido el **16 jul 2026**. Ambos son comodines válidos para el mismo dominio y
ambos "parecían" correctos: fechas en vigor, SAN correcto, clave coincidente. Pero
Cloudflare **solo acepta el de julio**. Lo más probable es que el de octubre quedara
revocado al emitirse el nuevo — Cloudflare comprueba revocación en Full (strict), y una
inspección local con `openssl` no lo detecta.

**Cómo se resolvió:** copiar el par cert+clave del front —que estaba demostrando ser válido,
porque el sitio público funcionaba bajo Full (strict)— a la EC2 del CMS, y recargar nginx.
El par antiguo quedó como `origin.{crt,key}.bak-20260831` por si hiciera falta.

**Para la próxima:** que un Origin CA se vea bien con `openssl x509` no significa que
Cloudflare lo acepte. Si aparece un 526, la primera sospecha debe ser el certificado
revocado, y la comprobación más rápida es **usar el mismo par que ya funciona en otro
origen de la misma zona**. Y conviene activar Full (strict) en una ventana de baja
actividad, con alguien mirando.

El front (`52.22.39.33`) ya tenía su Origin CA y escuchaba en 443; solo le faltan los
pasos 5 y 6.

---

## Lo que ya está aplicado

El nginx del CMS escucha ahora en 443 con el certificado **Cloudflare Origin CA** que ya
estaba en la instancia desde octubre de 2025 (`/etc/ssl/cloudflare/origin.{crt,key}`,
comodín `*.asociacionzonasfrancas.org`, válido hasta 2040). No hizo falta mover ninguna
clave entre máquinas.

Verificado en producción tras la recarga:

```
por Cloudflare        /_health 204 · /api/affiliates 200 · /admin 200
origen por HTTPS      /_health 204 · /api/affiliates 200
certificado           CloudFlare Origin CA, *.asociacionzonasfrancas.org, hasta 2040
TLS                   1.0 rechazado · 1.1 rechazado · 1.2 y 1.3 aceptados
```

**El puerto 80 sigue sirviendo la aplicación a propósito.** Este subdominio está aún en
modo Flexible, así que el edge habla con el origen por HTTP; redirigir ahora dejaría el
CMS en un bucle de redirecciones.

---

## Paso 3 — Cloudflare a Full (strict) ✅ hecho

Verificado el 31 de agosto tras sustituir el certificado:

```
CMS por Cloudflare    /_health 204 · /api/affiliates 200 · /admin 200
API que usa el front  /api/press-rooms 200 · /api/homepage 200 · /api/global-setting 200
sitio público         5 rutas, todas 200, entre 0,29 y 0,57 s
conexiones al origen  7 establecidas, TODAS en el 443 y ninguna en el 80
```

Esa última línea es la que confirma que el edge ya habla cifrado con el origen.

## Paso 4 — Redirigir 80 → 443 en el CMS ✅ hecho

El bloque `:80` ya no sirve la aplicación: solo redirige. Verificado tras la recarga:

```
http://34.228.145.249/_health   (Host: cms…)  → 301 a https://cms…/_health
http://34.228.145.249/admin     (Host: cms…)  → 301 a https://cms…/admin
https://34.228.145.249/_health  (Host: cms…)  → 204

CMS por Cloudflare    /_health 204 · /api/affiliates 200 · /admin 200
sitio público         5 rutas en 200 · API del front en 200
conexiones al origen  7, todas en 443
error.log de nginx    vacío
```

**El panel de administración ya no es alcanzable en claro por ningún camino.**

Si alguna vez hubiera que volver a Flexible, hay que **comentar la redirección antes** o el
CMS entra en bucle. Copias de seguridad en la instancia:
`azfacms.bak-20260831` (config original, sin TLS) y `azfacms.bak-tls-20260831` (con TLS y
el 80 aún sirviendo).

## Paso 5 — Restringir el security group ✅ hecho

Aplicado el 31 de agosto con una única prefix list IPv4 (`Max entries: 20`) y dos reglas
por security group. Verificado desde fuera:

```
DEBE SEGUIR FUNCIONANDO
  asociacionzonasfrancas.org/                        200   0,57 s
  asociacionzonasfrancas.org/sala-de-prensa/noticias 200   0,59 s
  asociacionzonasfrancas.org/nuestros-afiliados      200   0,28 s
  cms…/_health                                       204   0,33 s
  cms…/admin                                         200   0,33 s
  cms…/api/affiliates                                200   0,27 s
  origin.asociacionzonasfrancas.org/                 200

DEBE AGOTAR EL TIEMPO  (la prueba de que filtra)
  34.228.145.249:80    TIMEOUT
  34.228.145.249:443   TIMEOUT
  52.22.39.33:80       TIMEOUT
  52.22.39.33:443      TIMEOUT

LO QUE NO DEBÍA ROMPERSE
  SSH al CMS y al front                    OK
  Strapi                                   online, 55 días sin reiniciar
  Conexión a RDS (sg ec2-rds-1 intacto)    OK
  POST /api/revalidate                     401 sin token, o sea responde y valida
```

**El origen ya no es alcanzable por IP.** El WAF, el rate limiting y las reglas de acceso
de Cloudflare dejan de ser opcionales.

### Antes: se comprobó que no se rompe nada

Se revisaron los logs de acceso de las dos instancias buscando peticiones cuya IP de
cliente **no** esté en los rangos de Cloudflare. Resultado:

| | Peticiones totales | Ajenas a Cloudflare | Qué eran |
|---|---|---|---|
| CMS | 1 105 | 468 | Escaneo: 350 desde 4 IPs de Azure **sin user-agent**, buscando backdoors de WordPress; el resto pedía `/.env`, `/x.php`, `/wp-admin/…`. Todas 404 |
| Front | 7 021 | 375 | Lo mismo: 13 peticiones a `/.env`, 2 a `/.git/config`, sondas de WordPress |

Las únicas peticiones ajenas que **no** eran escaneo resultaron ser las verificaciones de
esta misma sesión (`curl/8.2.1` desde una IP colombiana).

Y el despliegue tampoco se ve afectado: el `POST /api/revalidate` del workflow de GitHub
Actions va contra `http://127.0.0.1:3000` **desde dentro de la instancia**, por el túnel
SSH, así que no atraviesa el security group.

**Conclusión: no hay tráfico legítimo entrando por 80/443 fuera de Cloudflare.** Cerrar es
seguro. Y esas 13 peticiones a `/.env` son buen recordatorio de por qué conviene.

### Datos de las instancias

| | Instancia | Security group a tocar | Otros SG | AZ |
|---|---|---|---|---|
| CMS | `i-04addd99c5857bc23` | `launch-wizard-1` · `sg-0033bcbcd008162b1` | `ec2-rds-1` · `sg-064756a879b28cbcf` — **no tocar**, es el de RDS | us-east-1b |
| Front | `i-0a16361b318e8c6d8` | `launch-wizard-2` · `sg-0b3d187ac9426e139` | — | us-east-1d |

Ambas en la VPC `vpc-0075c8d937161d625`.

### La forma rápida: el script

```bash
AWS_PROFILE=azfa bash deploy/cerrar-security-groups.sh            # simulación
AWS_PROFILE=azfa APLICAR=1 bash deploy/cerrar-security-groups.sh  # de verdad
```

Comprueba primero que las credenciales son de la cuenta **687980258625** y aborta si no.
Usa **listas de prefijos gestionadas** en vez de 44 reglas sueltas: cuando Cloudflare
cambie sus rangos se actualiza la lista una vez y los dos security groups lo heredan.

El script **añade las reglas nuevas antes de quitar las abiertas**, y se detiene en medio
para que verifiques. Ese orden es lo que evita el corte.

### La forma manual, por consola

Es **el cambio de mayor impacto y el más barato**: mientras el origen acepte conexiones de
cualquier IP, el WAF y el rate limiting de Cloudflare son opcionales para quien conozca la
dirección.

**El orden importa. Primero añadir, verificar, y solo después quitar.** Si se borra la regla
abierta antes de tener puesta la restringida, el sitio se cae en el intervalo.

1. **VPC → Managed prefix lists → Create**. Una sola lista, `cloudflare-ipv4`, familia
   IPv4, **Max entries: 20**, con los 15 rangos de abajo.
2. **EC2 → Security Groups → `sg-0033bcbcd008162b1`** (CMS) **→ Edit inbound rules**.
   *Add rule* dos veces: Type `HTTP` y Type `HTTPS`, en ambas Source → `Custom` → la lista
   `cloudflare-ipv4`. Guardar.
3. Lo mismo en **`sg-0b3d187ac9426e139`** (front).

> ### ⚠️ El límite de reglas: por qué `Max entries` importa tanto
>
> AWS **no cuenta una prefix list como una regla: cuenta su `Max entries`**. Una lista con
> `Max entries: 30` referenciada en dos puertos consume **60 reglas**, que es justo el tope
> por defecto de un security group → *"The maximum number of rules per security group has
> been reached"*.
>
> Con `Max entries: 20` son 20 × 2 = **40 reglas**, que caben con margen incluso mientras
> conviven las reglas abiertas. Y quedan 5 huecos de holgura sobre los 15 rangos que
> Cloudflare publica hoy.
>
> **Y no se crea lista IPv6.** Ninguna de las dos instancias tiene dirección IPv6
> —comprobado por metadata, `/ipv6s` devuelve 404— y los dominios no publican AAAA propios,
> así que Cloudflare solo las alcanza por IPv4. Las reglas IPv6 nunca casarían con nada y
> gastarían la mitad del presupuesto de reglas.
>
> El `Max entries` **solo se puede subir**, nunca bajar. Si una lista se creó con un valor
> demasiado alto hay que borrarla y rehacerla, y para borrarla no puede estar referenciada
> en ningún security group.
4. **Verificar** que todo sigue en pie antes de continuar:
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' https://asociacionzonasfrancas.org/
   curl -s -o /dev/null -w '%{http_code}\n' https://cms.asociacionzonasfrancas.org/_health
   ```
   Deben dar `200` y `204`.
5. Solo entonces, en los dos security groups, **borrar las reglas de 80 y 443 con origen
   `0.0.0.0/0` y `::/0`**.

Los rangos, descargados el 31 ago 2026 de `cloudflare.com/ips-v4` y `ips-v6` — conviene
reconfirmarlos, Cloudflare los actualiza de vez en cuando:

**IPv4**

```
173.245.48.0/20     103.21.244.0/22     103.22.200.0/22     103.31.4.0/22
141.101.64.0/18     108.162.192.0/18    190.93.240.0/20     188.114.96.0/20
197.234.240.0/22    198.41.128.0/17     162.158.0.0/15      104.16.0.0/13
104.24.0.0/14       172.64.0.0/13       131.0.72.0/22
```

**IPv6** — *no hacen falta, ver el aviso de arriba: las instancias no tienen IPv6*

```
2400:cb00::/32      2606:4700::/32      2803:f800::/32      2405:b500::/32
2405:8100::/32      2a06:98c0::/29      2c0f:f248::/32
```

### Tres avisos

- **No tocar la regla del puerto 22**, o se pierde el acceso SSH. Los runners de GitHub
  Actions también lo necesitan para desplegar el front.
- **No tocar `ec2-rds-1` (`sg-064756a879b28cbcf`)** en la instancia del CMS: es el que
  permite la conexión a la base de datos.
- El subdominio `origin.asociacionzonasfrancas.org` —el alias que se usó para probar el
  front antes del corte de DNS— seguirá funcionando, porque también pasa por Cloudflare.

### Verificación

Lo que **debe seguir funcionando**:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://asociacionzonasfrancas.org/          # 200
curl -s -o /dev/null -w '%{http_code}\n' https://cms.asociacionzonasfrancas.org/_health  # 204
curl -s -o /dev/null -w '%{http_code}\n' https://cms.asociacionzonasfrancas.org/admin    # 200
```

Lo que **debe dejar de funcionar** — esta es la prueba de que el cierre surtió efecto:

```bash
curl -m 10 -H "Host: cms.asociacionzonasfrancas.org" http://34.228.145.249/_health
curl -km 10 -H "Host: cms.asociacionzonasfrancas.org" https://34.228.145.249/_health
curl -km 10 -H "Host: asociacionzonasfrancas.org"    https://52.22.39.33/
# los tres deben AGOTAR EL TIEMPO DE ESPERA, no responder
```

Ojo con el matiz: si responden «connection refused» en vez de agotar el tiempo, el
security group no está filtrando —simplemente no hay nada escuchando—. Lo que confirma el
filtrado es el **timeout**.

Y comprobar que el despliegue sigue vivo: lanzar el workflow de GitHub Actions
manualmente, o simplemente `ssh` a las dos instancias.

## Paso 6 — Authenticated Origin Pulls

Cierra el hueco que deja el paso 5: aunque el security group filtre por IP, cualquiera con
un servidor en Cloudflare podría alcanzar el origen. Con AOP el origen exige el certificado
cliente de Cloudflare.

1. En Cloudflare, **SSL/TLS → Origin Server → Authenticated Origin Pulls**, activarlo para
   la zona.
2. Descargar el certificado de CA de Cloudflare y dejarlo en el origen, por ejemplo en
   `/etc/ssl/cloudflare/authenticated_origin_pull_ca.pem`.
3. Añadir a cada bloque `server` de 443, en los dos servidores:

```nginx
ssl_client_certificate /etc/ssl/cloudflare/authenticated_origin_pull_ca.pem;
ssl_verify_client on;
```

4. `sudo nginx -t && sudo systemctl reload nginx`.

Conviene hacerlo **después** del paso 5 y verificando el CMS entre medias: si se activa
`ssl_verify_client on` con la zona aún en Flexible, el edge llegaría por el 80 y no se
notaría el fallo hasta el cambio.
