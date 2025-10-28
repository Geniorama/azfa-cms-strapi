export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Solo procesar requests de actualización de usuarios, NO tocar auth endpoints
    if (ctx.path.includes('/content-manager/collection-types/plugin::users-permissions.user') && 
        ctx.method === 'PUT' &&
        ctx.request.body?.data) {
      
      // Limpiar campo password si viene como null
      if (ctx.request.body.data.password === null || 
          ctx.request.body.data.password === '' ||
          ctx.request.body.data.password === undefined) {
        strapi.log.info('🧹 Eliminando campo password null/undefined del request de usuario');
        delete ctx.request.body.data.password;
      }
    }

    await next();
  };
};