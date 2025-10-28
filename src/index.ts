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
    const resetPasswordUrl = `https://asociacionzonasfrancas.org/auth/reset-password?code=${resetPasswordToken}`;
    
    // Plantilla de email configurada en el panel de administración
    const emailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bienvenido al Portal de Afiliados AZFA</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10356B;">Bienvenido al Portal de Afiliados AZFA</h2>
        
        <p>Hola,</p>
        
        <p>Tu cuenta ha sido creada exitosamente en el Portal de Afiliados AZFA. Para completar tu registro y comenzar a utilizar el portal, necesitas establecer una contraseña para tu cuenta.</p>
        
        <p>Para crear tu contraseña, haz clic en el siguiente enlace:</p>
        
        <p style="text-align: center; margin: 30px 0;">
            <a href="${resetPasswordUrl}" 
               style="background-color: #10356B; color: #ffffff; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
                Crear mi contraseña
            </a>
        </p>
        
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666; font-size: 12px;">
            ${resetPasswordUrl}
        </p>
        
        <p><strong>Información importante:</strong></p>
        <ul>
            <li>Este enlace expira en 24 horas por razones de seguridad</li>
            <li>No podrás acceder al portal hasta que establezcas tu contraseña</li>
            <li>Tu contraseña debe ser segura: mínimo 8 caracteres, con letras mayúsculas, minúsculas y números</li>
        </ul>
        
        <p>Si tienes problemas o necesitas asistencia, contacta a nuestro equipo en <a href="mailto:info@asociacionzonasfrancas.org">info@asociacionzonasfrancas.org</a></p>
        
        <p>Saludos cordiales,<br><strong>Equipo AZFA</strong></p>
    </div>
</body>
</html>`;

    // Enviar el email
    await strapi.plugins.email.services.email.send({
      to: user.email,
      from: strapi.config.get('plugins.email.config.settings.defaultFrom'),
      replyTo: strapi.config.get('plugins.email.config.settings.defaultReplyTo'),
      subject: 'Bienvenido al Portal de Afiliados AZFA - Crea tu contraseña',
      html: emailTemplate,
    });
    
    strapi.log.info(`Email de restablecimiento enviado a: ${user.email}`);
    return true;
  } catch (error) {
    strapi.log.error('Error al enviar email de restablecimiento:', error);
    throw error;
  }
}
