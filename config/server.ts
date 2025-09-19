export default ({ env }) => ({
  host: env('HOST', env('NODE_ENV') === 'production' ? '0.0.0.0' : 'localhost'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Configuración optimizada para Heroku
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
      requestTimeout: 600000, // 10 minutos para requests
      keepAliveTimeout: 650000, // 10 minutos y 50 segundos para keep-alive
      headersTimeout: 610000, // 10 minutos y 10 segundos para headers
    },
  },
});
