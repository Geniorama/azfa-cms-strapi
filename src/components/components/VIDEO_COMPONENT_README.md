# Componente Video con Validación Condicional

## Descripción
El componente Video permite al usuario elegir entre tres tipos de video. Aunque todos los campos son visibles en la interfaz, solo se requieren y validan los campos apropiados según el tipo seleccionado.

## Tipos de Video Disponibles

### 1. Upload (Subir Video)
- **Campo requerido**: `uploadedVideo`
- **Campos opcionales**: `thumbnail`, `autoplay`, `muted`, `loop`
- **Validación**: Debe subir un archivo de video

### 2. YouTube
- **Campo requerido**: `youtubeUrl`
- **Campos opcionales**: `thumbnail`, `autoplay`, `muted`, `loop`
- **Validación**: URL debe ser válida de YouTube
- **Formatos aceptados**:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`

### 3. Vimeo
- **Campo requerido**: `vimeoUrl`
- **Campos opcionales**: `thumbnail`, `autoplay`, `muted`, `loop`
- **Validación**: URL debe ser válida de Vimeo
- **Formato aceptado**: `https://vimeo.com/VIDEO_ID`

## Campos del Componente

| Campo | Tipo | Requerido | Condición |
|-------|------|-----------|-----------|
| `title` | string | No | Siempre visible |
| `videoType` | enumeration | Sí | Siempre visible |
| `uploadedVideo` | media | Condicional | Solo si `videoType === 'upload'` |
| `youtubeUrl` | string | Condicional | Solo si `videoType === 'youtube'` |
| `vimeoUrl` | string | Condicional | Solo si `videoType === 'vimeo'` |
| `thumbnail` | media | No | Siempre visible |
| `autoplay` | boolean | No | Siempre visible |
| `muted` | boolean | No | Siempre visible |
| `loop` | boolean | No | Siempre visible |

## Validaciones

El componente incluye validaciones automáticas del lado del servidor que:
1. **Verifican** que se haya seleccionado un tipo de video
2. **Requieren** el campo apropiado según el tipo seleccionado
3. **Validan** que las URLs de YouTube/Vimeo sean válidas
4. **Limpian** automáticamente los campos no utilizados según el tipo

### Comportamiento de Validación:
- **Al guardar**: Solo se requiere el campo correspondiente al tipo seleccionado
- **Limpieza automática**: Los campos no utilizados se limpian automáticamente
- **Mensajes de error**: Se muestran errores específicos para cada tipo de validación

## Uso en Content Types

```json
{
  "media": {
    "type": "component",
    "repeatable": false,
    "component": "components.video"
  }
}
```

## Ejemplos de URLs Válidas

### YouTube:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://www.youtube.com/embed/dQw4w9WgXcQ`

### Vimeo:
- `https://vimeo.com/123456789`
- `https://www.vimeo.com/123456789`
