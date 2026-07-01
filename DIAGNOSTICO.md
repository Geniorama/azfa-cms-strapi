# Diagnóstico — CMS Strapi AZFA

Fecha: 2026-04-09

---

## Problemas críticos

| # | Problema | Ubicación |
|---|----------|-----------|
| 1 | **Credenciales de producción expuestas** — `.env.prod` contiene contraseñas de RDS, claves AWS y SMTP en el repositorio | `.env.prod` |
| 2 | **Sin rate limiting** — endpoints de login, reset de contraseña y envío de email vulnerables a ataques de fuerza bruta | `config/middlewares.ts` |
| 3 | **Validación TLS deshabilitada** en email — `rejectUnauthorized: false` permite ataques MITM | `config/plugins.ts:50` |
| 4 | **Conflicto de lock files** — existen `package-lock.json` y `pnpm-lock.yaml` simultáneamente, causando instalaciones inconsistentes | raíz del proyecto |

---

## Problemas de seguridad (alta prioridad)

- **Sin configuración explícita de CORS** — usa defaults de Strapi, potencialmente demasiado permisivo en producción.
- **Dominio hardcodeado** `asociacionzonasfrancas.org` en plantillas de email — debería usar `PUBLIC_URL` del env (`src/index.ts`, `src/extensions/users-permissions/controllers/user.ts`).
- **Endpoint de reset password sin auth ni rate limit** — `POST /api/users/:id/send-password-email` puede ser abusado para spam.
- **Header `X-Powered-By`** expone que el servidor usa Strapi.
- **Sin protección CSRF** — endpoints POST sin validación de token.
- **Sin logging de auditoría** — envíos de email de reset de contraseña no registran quién los disparó.

---

## Problemas de código

- **Lógica de email duplicada** — existe en `src/index.ts` Y en `src/extensions/users-permissions/controllers/user.ts`. Consolidar en un solo lugar.
- **Console.log excesivos** en producción — `src/admin/app.tsx` tiene 12+ logs de debug que deberían eliminarse.
- **Detección de errores frágil** — `src/middlewares/upload-error-handler.ts` usa `string.includes()` en mensajes de error que pueden cambiar entre versiones de librerías.
- **TypeScript strict mode deshabilitado** — `tsconfig.json` tiene `"strict": false`, permite errores de tipos silenciosos.
- **Tipos `any`** en componentes admin — `src/admin/app.tsx` usa `ctx: any` en múltiples archivos.
- **Validación de URLs de video débil** — `src/components/components/video-lifecycle.js` usa regex demasiado permisivos para YouTube y Vimeo.

---

## Dependencias y build

- **Build desactualizado** — `dist/` compilado en diciembre 2024, necesita rebuild con `npm run build`.
- **Drift de versión** — `@strapi/provider-upload-aws-s3` resuelve a v5.23.6 vs package.json v5.18.0.
- **Sin tests automatizados** — solo existe un script manual de guía (`test-user-creation.js`), sin framework de testing (Jest, Vitest, etc.).
- **Sin estrategia de backups** — un solo archivo `backup-azfa.sql`, directorio `backups/` vacío.
- **`env.example` incompleto** — faltan variables opcionales como `DATABASE_SSL`, `AWS_*`, `IS_PROXIED`, `LOG_*`, `CRON_ENABLED`.

---

## Configuración actual

### Base de datos (`config/database.ts`)

- Cliente: PostgreSQL (configurable, soporta MySQL y SQLite como fallback)
- Connection pooling: min 1, max 5
- Acquire timeout: 60s, idle timeout: 30s
- SSL configurable vía `DATABASE_SSL`

### Servidor (`config/server.ts`)

- Host: `localhost` en dev, `0.0.0.0` en producción
- Puerto: 1337
- Proxy habilitado en producción
- Timeouts HTTP: 10 minutos (para uploads grandes)
- Logging: `info` en dev, `error` en producción
- CRON deshabilitado por defecto

### Middlewares (`config/middlewares.ts`)

- CSP configurado con dominio del bucket S3
- Body limits: 500MB para forms, JSON y archivos
- Middlewares custom: `upload-error-handler`, `sanitize-null-password`
- Sin rate limiting
- Sin configuración explícita de CORS

### Plugins (`config/plugins.ts`)

- **Upload (S3):** encriptación AES256, retry con backoff exponencial (5 reintentos), uploads secuenciales (queueSize: 1), límite 500MB.
- **Email (Nodemailer/Brevo):** SMTP en puerto 587, validación TLS deshabilitada, timeouts de 60s.

### API (`config/api.ts`)

- Paginación: default 25, máximo 100 resultados
- `withCount: true` habilitado

---

## Lo que está bien

- Credenciales correctamente externalizadas a variables de entorno.
- CSP headers configurados con dominio del bucket S3.
- Connection pooling en base de datos con timeouts razonables.
- Encriptación AES256 habilitada en objetos S3.
- Generación de tokens con `crypto.randomBytes` (criptográficamente seguro).
- Middleware `sanitize-null-password` protege contra manipulación de passwords.
- Middleware `upload-error-handler` previene exposición de información interna en errores.
- Timeouts HTTP apropiados para uploads grandes (10 minutos).
- Separación correcta dev/prod en configuración del servidor.
- Retry strategy con backoff exponencial para uploads a S3.
- Paginación con límite máximo para prevenir exfiltración de datos.
- `.gitignore` correctamente configurado para archivos sensibles.

---

## Archivos con código custom

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `src/index.ts` | Bootstrap, endpoint de email de password | Funcional, con duplicación |
| `src/extensions/users-permissions/controllers/user.ts` | Envío de email de password | Funcional, con duplicación |
| `src/extensions/users-permissions/routes/custom.ts` | Ruta custom de email | Funcional |
| `src/extensions/users-permissions/content-types/user/schema.json` | Schema extendido con relaciones | Funcional |
| `src/middlewares/sanitize-null-password.ts` | Sanitización de passwords nulos | Bueno |
| `src/middlewares/upload-error-handler.ts` | Manejo de errores de upload | Con observaciones |
| `src/components/components/video-lifecycle.js` | Validación de componente video | Con observaciones |
| `src/admin/app.tsx` | Inyección de botón custom en admin | Con observaciones |
| `src/admin/components/SendPasswordEmailButton.tsx` | Componente React del botón | Bueno |

---

## Acciones recomendadas (por prioridad)

1. **Rotar credenciales** y eliminar `.env.prod` del historial de git.
2. **Implementar rate limiting** en endpoints de autenticación y envío de email.
3. **Habilitar validación TLS** en configuración de email (`rejectUnauthorized: true`).
4. **Elegir un solo package manager** (npm o pnpm) y eliminar el lock file sobrante.
5. **Configurar CORS** explícitamente con orígenes permitidos para producción.
6. **Consolidar lógica de email** duplicada en un solo lugar.
7. **Limpiar console.logs** del código de admin en producción.
8. **Reconstruir `dist/`** con `npm run build` antes del próximo deploy.
9. **Migrar credenciales AWS** a IAM roles para instancia EC2.
10. **Completar `env.example`** con todas las variables opcionales documentadas.
11. **Habilitar TypeScript strict mode** y refactorizar gradualmente.
12. **Implementar tests automatizados** para middlewares y lógica custom.
13. **Establecer estrategia de backups** automatizados para la base de datos.
