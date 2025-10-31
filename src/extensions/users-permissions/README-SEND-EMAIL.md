# Envío Manual de Email de Creación de Contraseña

Se ha creado un endpoint personalizado para enviar manualmente el email de creación de contraseña a los usuarios.

## Endpoint

**POST** `/api/users/:id/send-password-email`

Donde `:id` es el ID del usuario al que se le enviará el email.

## Uso desde la Consola del Navegador

Cuando estés en la página de edición de un usuario en el Content Manager, puedes ejecutar este script en la consola del navegador:

```javascript
// Obtener el ID del usuario de la URL
const userId = window.location.pathname.match(/users\/([^\/]+)/)?.[1];

if (userId) {
  fetch(`/api/users/${userId}/send-password-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('✅ ' + data.message);
    } else {
      alert('❌ Error: ' + (data.error || 'No se pudo enviar el email'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('❌ Error al enviar el email');
  });
} else {
  alert('❌ No se pudo obtener el ID del usuario');
}
```

## Agregar un Botón en el Admin Panel

Para agregar un botón permanente en el Content Manager, necesitas crear un override del admin. Esto requiere:

1. Configurar `src/admin/app.tsx` (si no existe, cópialo de `app.example.tsx`)
2. Crear un componente React que inyecte el botón en el Content Manager
3. Usar el sistema de inyección de Strapi

**Nota:** Esta funcionalidad está disponible a través del endpoint, y puedes usar el script de la consola cuando lo necesites, o implementar el botón más adelante si es necesario.

