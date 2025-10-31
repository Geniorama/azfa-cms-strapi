import React, { useState } from 'react';
import { Button } from '@strapi/design-system';
import { Mail } from '@strapi/icons';

interface SendPasswordEmailButtonProps {
  userId: string | number;
}

const SendPasswordEmailButton: React.FC<SendPasswordEmailButtonProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    
    try {
      // Llamar al endpoint personalizado
      const response = await fetch(`/api/users/${userId}/send-password-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies para autenticación
        mode: 'cors',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        window.alert(`✅ ${data.message || 'Email enviado exitosamente'}`);
      } else {
        window.alert(`❌ ${data.error?.message || 'No se pudo enviar el email'}`);
      }
    } catch (error: any) {
      console.error('Error al enviar email:', error);
      window.alert('❌ Error al enviar el email. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      startIcon={<Mail />}
      onClick={handleSendEmail}
      disabled={loading || !userId}
      loading={loading}
      size="S"
    >
      {loading ? 'Enviando...' : 'Enviar Email de Contraseña'}
    </Button>
  );
};

export default SendPasswordEmailButton;

