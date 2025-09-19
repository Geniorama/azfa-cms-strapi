export default (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      // Log del error para debugging
      strapi.log.error('Upload error:', error);
      
      // Si es un error relacionado con upload
      if (ctx.path.includes('/upload') || ctx.path.includes('/api/upload')) {
        // Verificar si el error es por tamaño de archivo
        if (error.message && error.message.includes('LIMIT_FILE_SIZE')) {
          ctx.status = 413;
          ctx.body = {
            error: {
              status: 413,
              name: 'PayloadTooLargeError',
              message: 'El archivo es demasiado grande. El límite máximo es 500MB.',
              details: {
                size: '500MB',
                currentFile: ctx.request.body?.files?.name || 'Archivo desconocido'
              }
            }
          };
          return;
        }
        
        // Verificar si es un error de timeout
        if (error.message && (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
          ctx.status = 408;
          ctx.body = {
            error: {
              status: 408,
              name: 'RequestTimeoutError',
              message: 'La carga del archivo ha excedido el tiempo límite. Intenta con un archivo más pequeño.',
              details: {
                timeout: '10 minutes'
              }
            }
          };
          return;
        }
        
        // Verificar si es un error de AWS S3
        if (error.message && error.message.includes('AWS')) {
          ctx.status = 502;
          ctx.body = {
            error: {
              status: 502,
              name: 'StorageError',
              message: 'Error al conectar con el almacenamiento. Intenta nuevamente en unos momentos.',
              details: {
                provider: 'AWS S3'
              }
            }
          };
          return;
        }
        
        // Error genérico de upload
        ctx.status = 500;
        ctx.body = {
          error: {
            status: 500,
            name: 'UploadError',
            message: 'Error interno del servidor durante la carga del archivo.',
            details: {
              timestamp: new Date().toISOString(),
              path: ctx.path
            }
          }
        };
        return;
      }
      
      // Para otros errores, continuar con el manejo normal
      throw error;
    }
  };
};
