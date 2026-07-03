export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          // Buckets S3 permitidos: testazfabucket (dev/local, us-east-2) y
          // amzn-s3-azfa-strapi (producción, us-east-1). Ambos para que dev y
          // prod carguen media con el mismo middlewares.ts.
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https://testazfabucket.s3.us-east-2.amazonaws.com', 'https://amzn-s3-azfa-strapi.s3.us-east-1.amazonaws.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://testazfabucket.s3.us-east-2.amazonaws.com', 'https://amzn-s3-azfa-strapi.s3.us-east-1.amazonaws.com'],
          'frame-src': ["'self'"],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      // Límites bajos para payloads no-archivo (mitiga DoS por agotamiento de
      // memoria). Las cargas de archivos usan formidable.maxFileSize (500MB).
      formLimit: "2mb",  // Formularios urlencoded
      jsonLimit: "2mb",  // Cuerpos JSON
      textLimit: "2mb",  // Cuerpos de texto
      formidable: {
        maxFileSize: 500 * 1024 * 1024, // 500MB límite de archivo - aumentado
        maxFields: 1000, // Máximo número de campos
        maxFieldsSize: 20 * 1024 * 1024, // 20MB para campos de texto
        keepExtensions: true, // Mantener extensiones de archivo
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Middleware personalizado para manejo de errores de upload
  {
    name: 'global::upload-error-handler',
    config: {},
  },
  {
    name: 'global::sanitize-null-password',
    config: {},
  },
];
