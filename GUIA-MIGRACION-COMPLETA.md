# 🚀 Guía Completa de Migración a AWS RDS + Elastic Beanstalk

## 📋 Resumen del Proyecto

Este proyecto te proporciona **scripts automatizados** y **configuraciones completas** para migrar tu aplicación Strapi a AWS, incluyendo:

- ✅ **Base de datos PostgreSQL en RDS**
- ✅ **Aplicación desplegada en Elastic Beanstalk**
- ✅ **Scripts de backup y restauración**
- ✅ **Configuración de Nginx optimizada**
- ✅ **Scripts de despliegue automatizado**

## 🎯 Objetivos de la Migración

1. **Migrar base de datos** de local/desarrollo a AWS RDS
2. **Desplegar aplicación** en Elastic Beanstalk
3. **Configurar escalabilidad** automática
4. **Implementar monitoreo** y logs
5. **Optimizar rendimiento** para producción

## 🛠️ Herramientas y Scripts Disponibles

### Scripts de Base de Datos
- `scripts/backup-database.ps1` - Backup de base de datos local
- `scripts/restore-database.ps1` - Restauración en RDS
- `scripts/setup-rds.ps1` - Configuración inicial de RDS
- `scripts/test-connection.ps1` - Prueba de conectividad

### Scripts de Despliegue
- `scripts/deploy-eb.ps1` - Despliegue en Elastic Beanstalk

### Configuraciones
- `.ebextensions/01_environment.config` - Configuración de EB
- `.ebextensions/02_nginx.config` - Configuración de Nginx
- `env.example` - Variables de entorno de ejemplo

## 🚀 Pasos de Migración

### **FASE 1: Preparación del Entorno**

#### 1.1 Instalar Herramientas Necesarias
```powershell
# Instalar PostgreSQL client
winget install PostgreSQL.PostgreSQL

# Instalar EB CLI
pip install awsebcli

# Verificar instalaciones
psql --version
eb --version
```

#### 1.2 Configurar Variables de Entorno
```powershell
# Crear archivo .env
copy env.example .env
notepad .env

# Configurar credenciales de RDS
$env:RDS_HOST = "tu-endpoint-rds.region.rds.amazonaws.com"
$env:RDS_PORT = "5432"
$env:RDS_NAME = "strapi"
$env:RDS_USER = "strapi"
$env:RDS_PASSWORD = "tu-contraseña-segura"
```

### **FASE 2: Migración de Base de Datos**

#### 2.1 Hacer Backup de la Base de Datos Actual
```powershell
# Configurar variables para la base de datos actual
$env:DATABASE_HOST = "localhost"  # o tu servidor actual
$env:DATABASE_PORT = "5432"
$env:DATABASE_NAME = "strapi"
$env:DATABASE_USERNAME = "strapi"
$env:DATABASE_PASSWORD = "tu-contraseña-actual"

# Ejecutar backup
.\scripts\backup-database.ps1
```

#### 2.2 Configurar RDS
```powershell
# Probar conectividad
.\scripts\test-connection.ps1

# Configurar base de datos
.\scripts\setup-rds.ps1
```

#### 2.3 Restaurar Backup en RDS
```powershell
# Restaurar desde el archivo de backup
.\scripts\restore-database.ps1 .\backups\strapi_backup_YYYYMMDD_HHMMSS.sql
```

### **FASE 3: Configuración de la Aplicación**

#### 3.1 Actualizar Variables de Entorno
```env
# En tu archivo .env
DATABASE_CLIENT=postgres
DATABASE_HOST=tu-endpoint-rds.region.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=tu-contraseña-segura
DATABASE_SSL=true
```

#### 3.2 Probar Aplicación Localmente
```powershell
# Recompilar Strapi
npm run build

# Iniciar con nueva configuración
npm run start
```

### **FASE 4: Despliegue en Elastic Beanstalk**

#### 4.1 Configurar AWS CLI
```powershell
# Configurar credenciales de AWS
aws configure

# O usar perfiles específicos
aws configure --profile production
```

#### 4.2 Desplegar Aplicación
```powershell
# Desplegar en Elastic Beanstalk
.\scripts\deploy-eb.ps1 "mi-aplicacion-strapi" "produccion"
```

#### 4.3 Verificar Despliegue
```powershell
# Verificar estado
eb status produccion

# Abrir aplicación
eb open produccion

# Ver logs
eb logs produccion
```

## 🔧 Configuraciones Avanzadas

### Configuración de RDS
- **Instancia**: db.t3.micro (desarrollo) o db.t3.small (producción)
- **Almacenamiento**: 20GB inicial con auto-scaling
- **Backup**: 7 días de retención
- **Mantenimiento**: Ventana de mantenimiento automático

### Configuración de Elastic Beanstalk
- **Tipo de instancia**: t3.small
- **Escalado**: 1-4 instancias
- **Health check**: ELB con timeout de 60 segundos
- **Logs**: CloudWatch con retención de 7 días

### Configuración de Nginx
- **Proxy reverso** para Strapi
- **Timeouts optimizados** para uploads
- **Headers de proxy** para Strapi
- **Health check** para Elastic Beanstalk

## 📊 Monitoreo y Mantenimiento

### Logs Disponibles
- **Aplicación**: `/var/log/nodejs/`
- **Nginx**: `/var/log/nginx/`
- **Sistema**: `/var/log/`
- **CloudWatch**: Logs centralizados en AWS

### Métricas de Monitoreo
- **CPU y memoria** de las instancias
- **Latencia** de la base de datos
- **Throughput** de la aplicación
- **Errores** y códigos de estado HTTP

### Mantenimiento
- **Backups automáticos** de RDS
- **Parches de seguridad** automáticos
- **Escalado automático** basado en métricas
- **Health checks** continuos

## 🚨 Solución de Problemas Comunes

### Problemas de Conectividad RDS
```powershell
# Verificar grupo de seguridad
# Verificar endpoint correcto
# Verificar credenciales
.\scripts\test-connection.ps1
```

### Problemas de Despliegue
```powershell
# Verificar logs
eb logs produccion

# Verificar estado
eb status produccion

# Reintentar despliegue
eb deploy produccion
```

### Problemas de Rendimiento
```powershell
# Verificar métricas de RDS
# Verificar uso de CPU/memoria
# Ajustar configuración de pool de conexiones
```

## 🔒 Seguridad y Mejores Prácticas

### Seguridad de RDS
- **Encriptación en tránsito** (SSL/TLS)
- **Encriptación en reposo**
- **Grupos de seguridad** restrictivos
- **IAM roles** cuando sea posible

### Seguridad de la Aplicación
- **Variables de entorno** para credenciales
- **HTTPS** en producción
- **Headers de seguridad** configurados
- **Rate limiting** implementado

### Seguridad de AWS
- **Principio de menor privilegio**
- **Auditoría** de accesos
- **Monitoreo** de actividades sospechosas
- **Backups** regulares y verificados

## 📚 Recursos Adicionales

### Documentación Oficial
- [Strapi Documentation](https://docs.strapi.io/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)

### Herramientas de Desarrollo
- [PostgreSQL Client](https://www.postgresql.org/download/windows/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)

### Comunidad y Soporte
- [Strapi Community](https://forum.strapi.io/)
- [AWS Developer Forums](https://forums.aws.amazon.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/strapi)

## 🎉 ¡Migración Completada!

Una vez que hayas seguido todos los pasos, tendrás:

- ✅ **Aplicación Strapi** funcionando en AWS
- ✅ **Base de datos PostgreSQL** en RDS
- ✅ **Escalabilidad automática** configurada
- ✅ **Monitoreo y logs** implementados
- ✅ **Backups automáticos** funcionando
- ✅ **Seguridad** configurada según mejores prácticas

### Próximos Pasos Recomendados
1. **Configurar dominio personalizado** con Route 53
2. **Implementar CDN** con CloudFront
3. **Configurar alertas** en CloudWatch
4. **Implementar CI/CD** con GitHub Actions
5. **Configurar monitoreo** de rendimiento

---

**¿Necesitas ayuda?** Revisa los logs, consulta la documentación o contacta al equipo de soporte de AWS.

