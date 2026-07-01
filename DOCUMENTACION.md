# Documentación — CMS Strapi AZFA

Aplicación **Strapi 5** que actúa como **CMS headless** para el sitio y portales relacionados con la Asociación de Zonas Francas (contenido institucional, prensa, afiliados, estudios, eventos, etc.).

## Requisitos

- **Node.js** ≥ 20.17.0  
- **npm** ≥ 10.0.0  
- Base de datos: en desarrollo típicamente **PostgreSQL** o **SQLite**; en producción el proyecto está configurado para **PostgreSQL** (compatible con **Amazon RDS**).

## Instalación y ejecución

```bash
npm install
```

### Modo desarrollo

- `npm run develop` — Arranque estándar de Strapi (carga las variables de entorno según la convención de Strapi / archivos `.env`).
- `npm run start:local` — Usa `start-dev.js`, que carga **`.env.local`** y luego **`.env`** antes de ejecutar `strapi develop` (útil si centralizas secretos locales en `.env.local`).

### Compilación y producción

```bash
npm run build
npm run start
```

En el servidor (por ejemplo una instancia **EC2**), suele ejecutarse `build` una vez por despliegue y `start` como proceso gestionado (systemd, PM2, contenedor, etc.).

## Estructura del proyecto

| Ruta | Descripción |
|------|-------------|
| `config/` | Servidor, base de datos, plugins, API REST, admin, middlewares |
| `src/api/` | Colecciones (content-types), controladores, rutas y servicios por dominio |
| `src/components/` | Componentes reutilizables para los esquemas (secciones, bloques) |
| `src/extensions/` | Extensiones del core (por ejemplo `users-permissions`) |
| `src/middlewares/` | Middlewares globales personalizados |

## Colecciones de contenido (API)

Cada entrada en `src/api/*/content-types/` corresponde a un tipo de contenido expuesto vía **REST** (y administrable desde el panel de Strapi):

- `about-us-page`, `homepage`, `contact-page`, `services-page`, `events-page`
- `press-room`, `press-room-page`, `press-room-category`
- `publication`, `publication-page`
- `study`, `studies-page`, `studies-portal`
- `affiliate`, `affiliate-portal`, `our-affiliates-page`, `affiliate-portal-investment-statistics-page`
- `event`, `team-member`, `testimonial`, `statistic`, `investment-statistics-page`
- `trade-zones-page`, `incentive`, `legal-regulations`, `real-state-offer`, `real-state-offer-page`
- `management`, `management-portal`, `ads-manager`, `map-country`
- `global-setting`, `contact-form`

La documentación interactiva de los endpoints está disponible en el panel de Strapi y en la referencia REST estándar de Strapi 5.

## Plugins y proveedores

- **@strapi/plugin-users-permissions** — Autenticación de usuarios y permisos de API.
- **@strapi/plugin-cloud** — Integración con el ecosistema Strapi Cloud (según despliegue).
- **@strapi/provider-upload-aws-s3** — Subida de medios a **Amazon S3** (bucket configurado por variables de entorno).
- **@strapi/provider-email-nodemailer** — Envío de correo (por defecto host SMTP tipo Brevo; configurable).
- **strapi-plugin-country-select**, **strapi-plugin-multi-select** — Campos adicionales en el admin.

## Variables de entorno relevantes

No commitees archivos con secretos. Los nombres que usa el proyecto (según `config/`) incluyen:

**Aplicación y servidor**

- `NODE_ENV`, `HOST`, `PORT`, `PUBLIC_URL`
- `APP_KEYS` (array)
- `IS_PROXIED` — Detrás de proxy/load balancer en producción
- `LOG_LEVEL`, `LOG_REQUESTS`, `CRON_ENABLED`

**Admin y seguridad Strapi**

- `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`
- `FLAG_NPS`, `FLAG_PROMOTE_EE` (opcionales)

**Base de datos (PostgreSQL en RDS)**

- `DATABASE_CLIENT` (por defecto `postgres`)
- `DATABASE_URL` o conjunto `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `DATABASE_SCHEMA`, `DATABASE_SSL`, opciones SSL/Certificados si RDS exige SSL

**Amazon S3 (medios)**

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET`

**Correo (Nodemailer / Brevo u otro SMTP)**

- `SMTP_HOST`, `SMTP_PORT`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`
- `EMAIL_FROM`, `EMAIL_REPLY_TO`

Para entorno local con múltiples archivos, `start:local` prioriza la carga desde `.env.local`; en **producción** suele usarse un único conjunto de variables en la instancia **EC2** o en el sistema de orquestación.

## Comportamiento destacado

- **Límites de cuerpo y archivos** aumentados (hasta ~500MB) para formularios y subidas grandes; ver `config/middlewares.ts` y `config/plugins.ts`.
- **Política de seguridad de contenido (CSP)** en middlewares incluye orígenes permitidos para imágenes/medios; debe alinearse con el dominio público de tu bucket **S3** en cada entorno.
- Middlewares globales personalizados: manejo de errores de upload y saneo de contraseñas nulas (ver `config/middlewares.ts`).

## Producción (AWS)

En producción el sistema corre sobre:

- **Amazon EC2** — Proceso Node que ejecuta Strapi (`build` + `start`).
- **Amazon RDS** — PostgreSQL como almacén de metadatos, borradores, usuarios del admin y relaciones del CMS.
- **Amazon S3** — Almacenamiento de archivos subidos desde el Media Library.

Un resumen visual del despliegue y flujos está en [ARQUITECTURA.md](./ARQUITECTURA.md).

## Referencias

- [Documentación Strapi 5](https://docs.strapi.io/)
- [Provider AWS S3](https://docs.strapi.io/cloud/advanced/upload)
