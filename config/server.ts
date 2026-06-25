export default ({ env }) => ({
  host: env('HOST', env('NODE_ENV') === 'production' ? '0.0.0.0' : 'localhost'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Configuración optimizada para entornos desplegados detrás de proxy
  url: env('PUBLIC_URL', `http://${env('HOST', env('NODE_ENV') === 'production' ? '0.0.0.0' : 'localhost')}:${env.int('PORT', 1337)}`),
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
