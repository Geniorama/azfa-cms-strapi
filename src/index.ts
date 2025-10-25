import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // No necesitamos registrar servicios adicionales
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Registrar el lifecycle hook para el modelo de usuario
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      
      async afterCreate(event: any) {
        const { result } = event;
        
        strapi.log.info(`🔄 Lifecycle afterCreate ejecutado para usuario: ${result.email}`);
        strapi.log.info(`📊 Datos del usuario - confirmed: ${result.confirmed}, role: ${result.role?.type || 'sin rol'}`);
        
        // Verificar si el usuario está confirmado (con o sin rol específico)
        if (result.confirmed === true) {
          try {
            strapi.log.info(`Usuario confirmado detectado: ${result.email} (rol: ${result.role?.type || 'sin rol'})`);
            
            // Generar token de restablecimiento de contraseña
            const crypto = require('crypto');
            const resetPasswordToken = crypto.randomBytes(64).toString('hex');

            // Actualizar el usuario con el token
            await strapi
              .plugin('users-permissions')
              .service('user')
              .edit(result.id, {
                resetPasswordToken: resetPasswordToken,
              });

            // Enviar email de restablecimiento de contraseña
            await sendPasswordResetEmail(strapi, result, resetPasswordToken);

            strapi.log.info(`Email de restablecimiento enviado al usuario: ${result.email}`);
          } catch (error) {
            strapi.log.error('Error al enviar email de restablecimiento:', error);
          }
        }
      },

      async afterUpdate(event: any) {
        const { result, params } = event;
        
        strapi.log.info(`🔄 Lifecycle afterUpdate ejecutado para usuario: ${result.email}`);
        strapi.log.info(`📊 Datos del usuario - confirmed: ${result.confirmed}, role: ${result.role?.type || 'sin rol'}`);
        strapi.log.info(`📝 Datos de actualización - confirmed: ${params.data?.confirmed || 'no cambiado'}`);
        
        // Verificar si se actualizó el campo confirmed a true
        if (result.confirmed === true && 
            params.data && 
            params.data.confirmed === true) {
          try {
            strapi.log.info(`Usuario confirmado actualizado: ${result.email} (rol: ${result.role?.type || 'sin rol'})`);
            
            // Generar token de restablecimiento de contraseña
            const crypto = require('crypto');
            const resetPasswordToken = crypto.randomBytes(64).toString('hex');

            // Actualizar el usuario con el token
            await strapi
              .plugin('users-permissions')
              .service('user')
              .edit(result.id, {
                resetPasswordToken: resetPasswordToken,
              });

            // Enviar email de restablecimiento de contraseña
            await sendPasswordResetEmail(strapi, result, resetPasswordToken);

            strapi.log.info(`Email de restablecimiento enviado al usuario: ${result.email}`);
          } catch (error) {
            strapi.log.error('Error al enviar email de restablecimiento:', error);
          }
        }
      },
    });
  },
};

// Función helper para enviar email de restablecimiento de contraseña
async function sendPasswordResetEmail(strapi: Core.Strapi, user: any, resetPasswordToken: string) {
  try {
    // Construir la URL de restablecimiento
    const resetPasswordUrl = `${strapi.config.get('server.url')}/admin/auth/reset-password?code=${resetPasswordToken}`;
    
    // Leer las plantillas de email
    const fs = require('fs');
    const path = require('path');
    
    const htmlTemplate = fs.readFileSync(
      path.join(process.cwd(), 'src/extensions/users-permissions/email-templates/reset-password.html'),
      'utf8'
    );
    const textTemplate = fs.readFileSync(
      path.join(process.cwd(), 'src/extensions/users-permissions/email-templates/reset-password.txt'),
      'utf8'
    );
    
    // Reemplazar variables en las plantillas
    const htmlContent = htmlTemplate
      .replace(/\{\{username\}\}/g, user.username || user.email)
      .replace(/\{\{url\}\}/g, resetPasswordUrl);
      
    const textContent = textTemplate
      .replace(/\{\{username\}\}/g, user.username || user.email)
      .replace(/\{\{url\}\}/g, resetPasswordUrl);
    
    // Enviar el email
    await strapi.plugins.email.services.email.send({
      to: user.email,
      from: strapi.config.get('plugins.email.config.settings.defaultFrom'),
      replyTo: strapi.config.get('plugins.email.config.settings.defaultReplyTo'),
      subject: 'Restablecer tu Contraseña - AZFA',
      text: textContent,
      html: htmlContent,
    });
    
    strapi.log.info(`Email de restablecimiento enviado a: ${user.email}`);
    return true;
  } catch (error) {
    strapi.log.error('Error al enviar email de restablecimiento:', error);
    throw error;
  }
}
