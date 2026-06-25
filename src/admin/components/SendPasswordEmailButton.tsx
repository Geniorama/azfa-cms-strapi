import React, { useState } from 'react';
import { Button } from '@strapi/design-system';
import { Mail } from '@strapi/icons';
import { getFetchClient } from '@strapi/strapi/admin';

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
      // getFetchClient adjunta automáticamente el JWT de administrador en la
      // cabecera Authorization, requerido ahora por el endpoint.
      const { post } = getFetchClient();
      const { data } = await post(`/api/users/${userId}/send-password-email`);

      if (data?.success) {
        window.alert(`✅ ${data.message || 'Email enviado exitosamente'}`);
      } else {
        window.alert(`❌ ${data?.error?.message || 'No se pudo enviar el email'}`);
      }
    } catch (error: any) {
      console.error('Error al enviar email:', error);
      const message =
        error?.response?.data?.error?.message ||
        'Error al enviar el email. Por favor, inténtalo de nuevo.';
      window.alert(`❌ ${message}`);
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

