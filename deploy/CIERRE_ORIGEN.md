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
| 4. Redirección 80 → 443 en el CMS | CMS | 🔶 Ya se puede aplicar |
| 5. Restringir el security group | AWS | ⛔ Requiere la consola |
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

## Paso 4 — Redirigir 80 → 443 en el CMS

Ya se puede aplicar: el paso 3 está confirmado. En `deploy/nginx/cms.conf` hay una línea
comentada dentro del bloque `:80`:

```nginx
# return 301 https://$host$request_uri;
```

Descomentarla, copiar el fichero a `/etc/nginx/sites-available/azfacms`, y:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Paso 5 — Restringir el security group

Es **el cambio de mayor impacto y el más barato**: mientras el origen acepte conexiones de
cualquier IP, el WAF y el rate limiting de Cloudflare son opcionales para quien conozca la
dirección.

En la consola de AWS, en el security group de **cada una de las dos instancias**, sustituir
las reglas de entrada de los puertos 80 y 443 desde `0.0.0.0/0` por estos rangos
(descargados de `cloudflare.com/ips-v4` y `ips-v6` el 31 ago 2026 — conviene reconfirmarlos,
Cloudflare los actualiza de vez en cuando):

**IPv4**

```
173.245.48.0/20     103.21.244.0/22     103.22.200.0/22     103.31.4.0/22
141.101.64.0/18     108.162.192.0/18    190.93.240.0/20     188.114.96.0/20
197.234.240.0/22    198.41.128.0/17     162.158.0.0/15      104.16.0.0/13
104.24.0.0/14       172.64.0.0/13       131.0.72.0/22
```

**IPv6**

```
2400:cb00::/32      2606:4700::/32      2803:f800::/32      2405:b500::/32
2405:8100::/32      2a06:98c0::/29      2c0f:f248::/32
```

Dos avisos:

- **No tocar la regla del puerto 22**, o se pierde el acceso SSH. Los runners de GitHub
  Actions también necesitan el 22 abierto para desplegar el front.
- Tras aplicarlo, el subdominio `origin.asociacionzonasfrancas.org` —el alias que se usó
  para probar el front antes del corte de DNS— seguirá funcionando, porque también pasa por
  Cloudflare.

Comprobación de que ha surtido efecto, desde una máquina cualquiera:

```bash
curl -m 10 -H "Host: cms.asociacionzonasfrancas.org" http://34.228.145.249/_health
# debe agotar el tiempo de espera, no responder 204
```

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
