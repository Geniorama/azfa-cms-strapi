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
    
    // Limpiar password null en actualizaciones de usuarios
    if (ctx.path.includes('plugin::users-permissions.user') && (ctx.method === 'PUT' || ctx.method === 'PATCH')) {
      if (ctx.request.body?.data?.password !== undefined) {
        if (ctx.request.body.data.password === null || ctx.request.body.data.password === '') {
          delete ctx.request.body.data.password;
        }
      }
      
      if (ctx.request.body?.password !== undefined) {
        if (ctx.request.body.password === null || ctx.request.body.password === '') {
          delete ctx.request.body.password;
        }
      }
    }

    await next();
  };
};