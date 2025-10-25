# Configuración del Logo en Emails - AZFA

## Problema
El logo de AZFA no se está mostrando en los emails enviados desde Strapi.

## Solución Implementada
Se ha actualizado la plantilla `reset-password.html` con las siguientes mejoras:

1. **Fallback automático**: Si el logo no carga, se muestra "AZFA" como texto
2. **Estilos inline**: Mejor compatibilidad con clientes de email
3. **Metadatos mejorados**: Para mejor renderizado en diferentes clientes

## Configuración Requerida en AWS S3

Para que el logo funcione correctamente, el bucket de S3 debe estar configurado con:

### 1. Permisos Públicos
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::amzn-s3-azfa-strapi/*"
        }
    ]
}
```

### 2. Configuración CORS
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. Hosting de Sitio Web Estático (Opcional pero Recomendado)
- Habilitar "Hosting de sitio web estático" en las propiedades del bucket
- Usar la URL del endpoint del sitio web estático en lugar de la URL directa de S3

## URL Actual del Logo
```
https://amzn-s3-azfa-strapi.s3.us-east-1.amazonaws.com/logo_azfa_negro_7ca50938cd.svg
```

## Alternativas si S3 no Funciona

Si después de configurar S3 el logo sigue sin funcionar, considera:

1. **Convertir SVG a PNG**: Algunos clientes de email no soportan SVG
2. **Usar un CDN**: Como CloudFront para mejor compatibilidad
3. **Hosting alternativo**: Subir el logo a un servicio más compatible con emails

## Verificación
Para verificar que el logo funciona:
1. Envía un email de prueba
2. Verifica en diferentes clientes (Gmail, Outlook, Apple Mail)
3. Revisa los logs del servidor para errores 404 o 403

## Notas Técnicas
- El logo usa `filter: brightness(0) invert(1)` para convertirlo a blanco
- Se incluye un fallback con JavaScript `onerror`
- Los estilos están inline para máxima compatibilidad
