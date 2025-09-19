/**
 * Video component lifecycle hooks
 * Validates video fields based on videoType selection
 */

module.exports = {
  // Lifecycle hooks for the video component
  lifecycles: {
    async beforeCreate(event) {
      await validateVideoComponent(event.params.data);
    },

    async beforeUpdate(event) {
      await validateVideoComponent(event.params.data);
    },
  },
};

async function validateVideoComponent(data) {
  if (!data || !data.videoType) {
    throw new Error('El tipo de video es requerido');
  }

  const { videoType, uploadedVideo, youtubeUrl, vimeoUrl } = data;

  // Clear fields that shouldn't be used based on videoType
  switch (videoType) {
    case 'upload':
      if (!uploadedVideo) {
        throw new Error('Debe subir un video cuando selecciona "Subir video"');
      }
      // Clear other fields
      data.youtubeUrl = null;
      data.vimeoUrl = null;
      break;
    
    case 'youtube':
      if (!youtubeUrl) {
        throw new Error('Debe proporcionar una URL de YouTube cuando selecciona "YouTube"');
      }
      if (!isValidYouTubeUrl(youtubeUrl)) {
        throw new Error('La URL de YouTube no es válida. Ejemplo: https://www.youtube.com/watch?v=VIDEO_ID');
      }
      // Clear other fields
      data.uploadedVideo = null;
      data.vimeoUrl = null;
      break;
    
    case 'vimeo':
      if (!vimeoUrl) {
        throw new Error('Debe proporcionar una URL de Vimeo cuando selecciona "Vimeo"');
      }
      if (!isValidVimeoUrl(vimeoUrl)) {
        throw new Error('La URL de Vimeo no es válida. Ejemplo: https://vimeo.com/VIDEO_ID');
      }
      // Clear other fields
      data.uploadedVideo = null;
      data.youtubeUrl = null;
      break;
      
    default:
      throw new Error('Tipo de video no válido');
  }
}

function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/;
  return youtubeRegex.test(url);
}

function isValidVimeoUrl(url) {
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;
  return vimeoRegex.test(url);
}
