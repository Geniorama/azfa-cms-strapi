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
        
        if (result.confirmed === true) {
          try {
            const crypto = require('crypto');
            const resetPasswordToken = crypto.randomBytes(64).toString('hex');

            await strapi
              .plugin('users-permissions')
              .service('user')
              .edit(result.id, {
                resetPasswordToken: resetPasswordToken,
              });

            await sendPasswordResetEmail(strapi, result, resetPasswordToken);

            strapi.log.info(`✅ Email de creación de contraseña enviado a: ${result.email}`);
          } catch (error) {
            strapi.log.error('Error al enviar email:', error);
          }
        }
      },

      async beforeUpdate(event: any) {
        const { params } = event;
        if (params.where?.id) {
          const previousUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: params.where.id }
          });
          
          // Verificar si este update es solo para resetPasswordToken
          const isOnlyTokenUpdate = params.data?.resetPasswordToken !== undefined && 
                                    Object.keys(params.data).length === 1;
          
          // Si confirmed va a cambiar a true, generar el token ahora
          const willBeConfirmed = params.data?.confirmed === true;
          const wasNotConfirmed = !previousUser?.confirmed;
          
          if (willBeConfirmed && wasNotConfirmed && !isOnlyTokenUpdate) {
            const crypto = require('crypto');
            const resetPasswordToken = crypto.randomBytes(64).toString('hex');
            
            // Agregar el token a los datos que se van a actualizar
            params.data.resetPasswordToken = resetPasswordToken;
          }
          
          event.params.state = { 
            previousConfirmed: previousUser?.confirmed || false,
            isInternalUpdate: isOnlyTokenUpdate
          };
        }
      },

      async afterUpdate(event: any) {
        const { result, state } = event;
        
        // Salir si es una actualización interna (solo del token)
        if (state?.isInternalUpdate) {
          return;
        }
        
        const wasNotConfirmedBefore = !state?.previousConfirmed;
        const isConfirmedNow = result.confirmed === true;
        
        // Solo enviar email si confirmed cambió de false/undefined a true
        if (wasNotConfirmedBefore && isConfirmedNow) {
          try {
            const tokenToUse = result.resetPasswordToken;
            
            await sendPasswordResetEmail(strapi, result, tokenToUse);
            
            strapi.log.info(`✅ Email de creación de contraseña enviado a: ${result.email}`);
          } catch (error) {
            strapi.log.error('Error al enviar email:', error);
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
    
    // Email enviado exitosamente
    return true;
  } catch (error) {
    strapi.log.error('Error al enviar email de restablecimiento:', error);
    throw error;
  }
}
