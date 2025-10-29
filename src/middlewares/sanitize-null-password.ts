export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Excluir endpoints de autenticación y reset password
    const isAuthOrReset = ctx.path.includes('/auth/') || 
                          ctx.path.includes('/api/auth/') ||
                          ctx.path.includes('reset-password') ||
                          ctx.path.includes('forgot-password');
    
    if (isAuthOrReset) {
      return await next();
    }
    
    // Log para todos los requests de actualización de usuarios
    if (ctx.path.includes('plugin::users-permissions.user') && (ctx.method === 'PUT' || ctx.method === 'PATCH')) {
      strapi.log.info('🔍 Middleware sanitize-null-password ejecutándose:', {
        path: ctx.path,
        method: ctx.method,
        hasBody: !!ctx.request.body,
        hasData: !!ctx.request.body?.data,
        bodyKeys: ctx.request.body ? Object.keys(ctx.request.body) : [],
      });
      
      // Manejar diferentes ubicaciones del campo password
      let passwordFound = false;
      
      if (ctx.request.body?.data?.password !== undefined) {
        strapi.log.info('📝 Password encontrado en data.password:', ctx.request.body.data.password);
        passwordFound = true;
        if (ctx.request.body.data.password === null || ctx.request.body.data.password === '') {
          strapi.log.info('🧹 ELIMINANDO password de data.password');
          delete ctx.request.body.data.password;
        }
      }
      
      if (ctx.request.body?.password !== undefined && !passwordFound) {
        strapi.log.info('📝 Password encontrado en body.password:', ctx.request.body.password);
        if (ctx.request.body.password === null || ctx.request.body.password === '') {
          strapi.log.info('🧹 ELIMINANDO password de body.password');
          delete ctx.request.body.password;
        }
      }
      
      strapi.log.info('✅ Middleware completado');
    }

    await next();
  };
};