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
    // Registrar la ruta personalizada para enviar email
    // Usar un path personalizado que no requiera autenticación automática
    strapi.server.routes([
      {
        method: 'POST',
        path: '/api/users/:id/send-password-email',
        handler: async (ctx: any) => {
          try {
            // --- Autorización: solo administradores autenticados ---
            // La ruta usa `auth: false` (la estrategia de Content API no entiende
            // el JWT de admin), por lo que validamos el token de admin manualmente.
            const adminUser = await verifyAdminRequest(strapi, ctx);
            if (!adminUser) {
              return ctx.unauthorized('Se requiere autenticación de administrador');
            }

            const { id } = ctx.params;

            if (!id) {
              return ctx.badRequest('ID de usuario requerido');
            }

            // Detectar si el ID es un string (documentId) o número (id)
            const isStringId = typeof id === 'string' && !/^\d+$/.test(id);
            
            // Obtener el usuario usando documentId si es string, id si es número
            let user;
            if (isStringId) {
              // Para documentId, usar query builder de Knex directamente
              const query = strapi.db.connection('up_users')
                .where('document_id', id)
                .first();
              user = await query;
            } else {
              // Para id numérico, usar db.query normalmente
              user = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: Number(id) }
              });
            }
            
            if (!user) {
              return ctx.notFound('Usuario no encontrado');
            }
            
            // Obtener el ID correcto para la actualización
            const userId = user.documentId || user.id;
            
            // Generar un nuevo token de reset
            const crypto = require('crypto');
            const resetPasswordToken = crypto.randomBytes(64).toString('hex');
            
            // Actualizar usando el servicio de users-permissions con el ID correcto
            await strapi
              .plugin('users-permissions')
              .service('user')
              .edit(userId, {
                resetPasswordToken: resetPasswordToken,
              });
            
            // Enviar el email usando la función helper
            await sendPasswordResetEmail(strapi, user, resetPasswordToken);
            
            strapi.log.info(`✅ Email de creación de contraseña enviado manualmente a: ${user.email}`);
            
            ctx.body = {
              success: true,
              message: `Email enviado exitosamente a ${user.email}`
            };
          } catch (error) {
            strapi.log.error('Error al enviar email:', error);
            ctx.internalServerError('Error al enviar el email');
          }
        },
        config: {
          policies: [],
          middlewares: [],
          auth: false, // Desactivar autenticación automática para esta ruta
        },
      },
    ]);
    
    // Los lifecycle hooks han sido desactivados - el envío de email ahora es solo manual mediante el botón
  },
};

// Helper de autorización: valida el access token de administrador presente en la
// cabecera Authorization. Devuelve el usuario admin si es válido y está activo, o null.
//
// A partir de Strapi 5, el panel de admin usa un "session manager": el token que
// envía getFetchClient() es un access token JWT firmado con una clave interna de
// sesión (no con admin.auth.secret) y con una sesión asociada que debe estar activa.
// Por eso replicamos exactamente lo que hace la estrategia oficial `admin` en vez de
// verificar el JWT manualmente con admin.auth.secret (lo cual siempre fallaba).
async function verifyAdminRequest(strapi: Core.Strapi, ctx: any) {
  try {
    const authHeader: string | undefined = ctx.request?.header?.authorization;
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    const token = parts[1].trim();
    if (!token) {
      return null;
    }

    // El session manager valida la firma del access token y expone el payload.
    const manager = (strapi as any).sessionManager;
    if (!manager) {
      strapi.log.error('sessionManager no disponible; no se puede validar el token de admin');
      return null;
    }

    const result = manager('admin').validateAccessToken(token);
    if (!result?.isValid) {
      return null; // token inválido, expirado o no es de tipo access
    }

    // La sesión que respalda al token debe seguir activa (no revocada).
    const isActive = await manager('admin').isSessionActive(result.payload.sessionId);
    if (!isActive) {
      return null;
    }

    // Normalizar userId igual que la estrategia oficial (puede venir como string).
    const rawUserId = result.payload.userId;
    const numericUserId = Number(rawUserId);
    const userId =
      Number.isFinite(numericUserId) && String(numericUserId) === String(rawUserId)
        ? numericUserId
        : rawUserId;

    // Confirmar que el admin existe y sigue activo.
    const adminUser = await strapi.db.query('admin::user').findOne({
      where: { id: userId },
    });

    if (!adminUser || adminUser.isActive !== true || adminUser.blocked === true) {
      return null;
    }

    return adminUser;
  } catch (error) {
    strapi.log.error('Error verificando el token de administrador:', error);
    return null;
  }
}

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
