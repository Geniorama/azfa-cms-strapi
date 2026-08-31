export default ({ env }) => ({
  // Escuchar SOLO en loopback: en producción Strapi vive detrás del Nginx de la
  // misma instancia, que hace proxy a 127.0.0.1:1337, así que no hay motivo
  // para exponer el puerto en todas las interfaces. Antes el defecto era
  // `0.0.0.0`, y aunque el security group filtra el 1337 desde Internet, eso
  // dejaba la protección en una sola capa.
  //
  // OJO: el `.env` de la EC2 fija `HOST=0.0.0.0` y la variable gana sobre este
  // defecto. Para que el cambio surta efecto hay que ponerlo también allí y
  // reiniciar Strapi.
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Configuración optimizada para entornos desplegados detrás de proxy
  url: env('PUBLIC_URL', `http://${env('HOST', '127.0.0.1')}:${env.int('PORT', 1337)}`),
  proxy: env.bool('IS_PROXIED', env('NODE_ENV') === 'production'),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
  // Configuración de logs para producción
  logger: {
    level: env('LOG_LEVEL', env('NODE_ENV') === 'production' ? 'error' : 'info'),
    requests: env.bool('LOG_REQUESTS', false),
  },
  // Configuración de timeouts para uploads - aumentados para archivos grandes
  http: {
    serverOptions: {
      requestTimeout: 600000, // 10 min: necesario para uploads grandes (hasta 500MB)
      keepAliveTimeout: 65000, // 65s para keep-alive
      // 60s para recibir las cabeceras completas: mitiga slowloris sin afectar
      // a la transferencia del cuerpo del archivo (cubierta por requestTimeout).
      headersTimeout: 60000,
    },
  },
});
