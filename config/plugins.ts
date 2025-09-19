export default ({env}) => ({
    upload: {
        config: {
          provider: '@strapi/provider-upload-aws-s3',
          providerOptions: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
            region: env('AWS_REGION'),
            params: {
              Bucket: env('AWS_BUCKET'),
              ACL: null, // Eliminado ACL para evitar errores de permisos
            },
            s3Options: {
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
            // Configuración de tamaños de archivo - aumentado a 500MB
            sizeLimit: 500 * 1024 * 1024, // 500MB
          },
        },
    },
});
