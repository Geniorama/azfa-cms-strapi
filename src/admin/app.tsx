import type { StrapiApp } from '@strapi/strapi/admin';
import SendPasswordEmailButton from './components/SendPasswordEmailButton';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    console.log('🔧 Registrando botón de envío de email...');
    
    try {
      const contentManagerPlugin = app.getPlugin('content-manager');
      
      if (!contentManagerPlugin) {
        console.error('❌ No se encontró el plugin content-manager');
        return;
      }

      console.log('✅ Plugin content-manager encontrado');

      // Inyectar el botón usando la API correcta de Strapi v5
      contentManagerPlugin.injectComponent('editView', 'right-links', {
        name: 'SendPasswordEmailButton',
        Component: (props: any) => {
          console.log('🔍 SendPasswordEmailButton renderizado');
          console.log('📦 Todas las props:', props);
          console.log('📦 Keys de props:', Object.keys(props || {}));

          try {
            // Intentar obtener datos de diferentes formas
            const initialData = props?.initialData || props?.data || props?.entry || props?.modifiedData;
            const layout = props?.layout || props?.contentType || props?.schema;
            
            console.log('📋 Layout obtenido:', layout);
            console.log('📋 InitialData obtenido:', initialData);
            
            // Intentar obtener el contentType de diferentes formas
            let contentType = null;
            
            // Primero intentar desde el slug que viene en props
            if (props?.slug) {
              contentType = props.slug;
            }
            
            if (!contentType && layout) {
              contentType = layout.uid || layout.apiID || layout.kind;
            }
            
            // Si aún no tenemos contentType, intentar desde la URL
            if (!contentType && typeof window !== 'undefined') {
              const path = window.location.pathname;
              if (path.includes('plugin::users-permissions.user')) {
                contentType = 'plugin::users-permissions.user';
              }
            }
            
            console.log('📝 Content Type detectado:', contentType);

            // Solo mostrar el botón para usuarios, o si no podemos determinar el tipo
            // (para debugging, mostrar en todos los casos primero)
            if (contentType && contentType !== 'plugin::users-permissions.user') {
              console.log('⏭️ No es un usuario, no se muestra el botón');
              return null;
            }

            // Obtener el ID del usuario de diferentes posibles ubicaciones
            let userId = null;
            
            if (initialData) {
              userId = initialData.id || 
                       initialData.documentId || 
                       initialData.entry?.id ||
                       initialData.entry?.documentId;
            }
            
            // Si no tenemos userId, intentar desde la URL
            // La URL es: /admin/content-manager/collection-types/plugin::users-permissions.user/zjl0hlbvy8icpzmvyqtrgezw
            if (!userId && typeof window !== 'undefined') {
              const path = window.location.pathname;
              // Buscar el ID después del último '/' en la ruta de edición
              const match = path.match(/plugin::users-permissions\.user\/([^\/\?]+)/);
              if (match) {
                userId = match[1];
              } else {
                // Fallback: intentar obtener el último segmento de la URL después de /user/
                const altMatch = path.match(/\/user\/([^\/\?]+)/);
                if (altMatch) {
                  userId = altMatch[1];
                }
              }
            }
            
            console.log('🆔 User ID detectado:', userId);

            // Si no tenemos userId, no mostrar el botón
            if (!userId) {
              console.log('⚠️ No se encontró userId, no se mostrará el botón');
              return null;
            }

            console.log('✅ Renderizando botón para usuario:', userId);
            return <SendPasswordEmailButton userId={userId} />;
          } catch (error) {
            console.error('❌ Error en SendPasswordEmailButton component:', error);
            return null;
          }
        },
      });
      
      console.log('✅ Botón registrado exitosamente');
    } catch (error) {
      console.error('❌ Error al inyectar componente en Content Manager:', error);
      console.error('Error completo:', error);
    }
  },
};

