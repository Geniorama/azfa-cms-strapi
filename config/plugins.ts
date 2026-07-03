export default ({env}) => ({
    upload: {
        config: {
          provider: '@strapi/provider-upload-aws-s3',
          // Configuración de tamaños de archivo - aumentado a 500MB.
          // sizeLimit es opción del plugin upload (no de providerOptions); el
          // límite efectivo de la carga lo aplica formidable.maxFileSize (500MB)
          // en el middleware strapi::body.
          sizeLimit: 500 * 1024 * 1024, // 500MB
          providerOptions: {
            // En Strapi 5 (provider-upload-aws-s3, AWS SDK v3) todas las opciones
            // deben ir dentro de s3Options; pasarlas en la raíz está deprecado.
            s3Options: {
              credentials: {
                accessKeyId: env('AWS_ACCESS_KEY_ID'),
                secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
              },
              region: env('AWS_REGION'),
              params: {
                Bucket: env('AWS_BUCKET'),
                ACL: null, // Eliminado ACL para evitar errores de permisos
              },
              // Configuración mejorada para S3
              serverSideEncryption: 'AES256',
              // Timeout más largo para archivos grandes (5 minutos)
              timeout: 300000,
              // Configuración de reintentos
              maxRetries: 5,
              retryDelayOptions: {
                base: 300,
                customBackoff: function(retryCount, err) {
                  // Backoff exponencial para reintentos
                  return Math.pow(2, retryCount) * 1000;
                }
              },
              // Configuración para multipart uploads
              partSize: 10 * 1024 * 1024, // 10MB por parte
              queueSize: 1, // Número de partes a subir en paralelo
            },
          },
        },
    },

    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST', 'smtp-relay.brevo.com'),
          port: env.int('SMTP_PORT', 587),
          secure: false, // true para 465, false para otros puertos
          auth: {
            user: env('BREVO_SMTP_USER'),
            pass: env('BREVO_SMTP_PASS'),
          },
          tls: {
            // Verificar el certificado del servidor SMTP (evita MITM sobre las
            // credenciales). Configurable por si un entorno usa un cert interno.
            rejectUnauthorized: env.bool('SMTP_TLS_REJECT_UNAUTHORIZED', true),
          },
          // Configuración adicional para mejorar la compatibilidad
          connectionTimeout: 60000, // 60 segundos
          greetingTimeout: 30000, // 30 segundos
          socketTimeout: 60000, // 60 segundos
        },
        settings: {
          defaultFrom: env('EMAIL_FROM', 'noreply@asociacionzonasfrancas.org'),
          defaultReplyTo: env('EMAIL_REPLY_TO', 'noreply@asociacionzonasfrancas.org'),
        },
      },
    },
});
