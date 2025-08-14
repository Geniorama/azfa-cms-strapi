# Despliegue en Heroku - CMS Strapi AZFA

## Problemas de Memoria Solucionados

Este proyecto ha sido optimizado para resolver los errores R14 y R15 de memoria en Heroku.

## Cambios Realizados

### 1. Scripts de Inicio Optimizados
- **Antes**: `start: "NODE_ENV=production npm run build && node server.js"`
- **Después**: `start: "node server.js"` + `heroku-postbuild: "NODE_ENV=production npm run build"`

### 2. Configuración de Base de Datos
- Pool de conexiones reducido: `min: 1, max: 5` (antes `min: 2, max: 10`)
- Timeouts optimizados para conexiones
- Configuración de conexiones inactivas

### 3. Configuración del Servidor
- Logs optimizados para producción
- Cron jobs deshabilitados por defecto
- Configuración de proxy para Heroku

## Variables de Entorno Recomendadas

```bash
# Configuración de memoria
NODE_OPTIONS=--max-old-space-size=512
UV_THREADPOOL_SIZE=4

# Base de datos optimizada
DATABASE_POOL_MIN=1
DATABASE_POOL_MAX=3
DATABASE_ACQUIRE_TIMEOUT=30000
DATABASE_CREATE_TIMEOUT=15000
DATABASE_DESTROY_TIMEOUT=3000
DATABASE_IDLE_TIMEOUT=15000

# Strapi optimizado
CRON_ENABLED=false
LOG_LEVEL=error
STRAPI_TELEMETRY_DISABLED=true
```

## Comandos de Despliegue

### 1. Configurar Heroku CLI
```bash
heroku login
heroku git:remote -a tu-app-name
```

### 2. Configurar Variables de Entorno
```bash
heroku config:set NODE_ENV=production
heroku config:set NODE_OPTIONS="--max-old-space-size=512"
heroku config:set UV_THREADPOOL_SIZE=4
heroku config:set DATABASE_POOL_MIN=1
heroku config:set DATABASE_POOL_MAX=3
heroku config:set CRON_ENABLED=false
heroku config:set LOG_LEVEL=error
```

### 3. Desplegar
```bash
git add .
git commit -m "Optimización para Heroku - Memoria"
git push heroku main
```

### 4. Verificar Logs
```bash
heroku logs --tail
```

## Monitoreo de Memoria

### Verificar uso de memoria:
```bash
heroku ps
heroku logs --tail | grep "Memory"
```

### Escalar si es necesario:
```bash
heroku ps:scale web=1:basic
```

## Solución de Problemas

### Error R14 (Memory quota exceeded)
- Verificar variables de entorno de memoria
- Reducir `DATABASE_POOL_MAX`
- Deshabilitar cron jobs

### Error R15 (Memory quota vastly exceeded)
- Revisar logs para identificar picos de memoria
- Verificar conexiones de base de datos
- Considerar escalar a un dyno más grande

### App Crashed (H10)
- Verificar logs: `heroku logs --tail`
- Revisar configuración de base de datos
- Verificar variables de entorno

## Recursos Recomendados

- **Dyno**: `basic` o `standard-1x` (mínimo 512MB RAM)
- **Base de datos**: `heroku-postgresql:mini` o superior
- **Buildpack**: `heroku/nodejs`

## Contacto

Para soporte técnico, revisar los logs de Heroku y la documentación oficial de Strapi.
