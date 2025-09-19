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
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https://testazfabucket.s3.us-east-2.amazonaws.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://testazfabucket.s3.us-east-2.amazonaws.com'],
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
      formLimit: "500mb", // Límite para formularios - aumentado a 500MB
      jsonLimit: "500mb", // Límite para JSON - aumentado a 500MB
      textLimit: "500mb", // Límite para texto - aumentado a 500MB
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
];
