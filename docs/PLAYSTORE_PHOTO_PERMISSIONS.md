# Play Store — permisos de fotos y vídeos (rechazo)

## Qué pasó

Google rechazó la actualización por la **Política de permisos de fotos y vídeos**: el uso del permiso no está directamente relacionado con el objetivo principal de la app.

La app declaraba `READ_MEDIA_IMAGES` y `READ_EXTERNAL_STORAGE`, pero **no los necesita**:

- **Galería:** `Camera.pickImages()` usa el **selector de fotos de Android** (sin permiso de lectura de toda la galería).
- **Cámara:** solo `CAMERA` al tomar una foto para importar una rutina con IA.

## Cambio en código (v1.1.5+)

- Eliminados `READ_MEDIA_IMAGES` y `READ_EXTERNAL_STORAGE` del manifiesto.
- Se fuerza `tools:node="remove"` por si alguna dependencia los fusionaba.
- Se mantiene `CAMERA` (opcional, `required=false`).

## Pasos en Play Console (obligatorio)

1. **Política → Contenido de la app → Permisos de fotos y vídeos**
   - Indica que la app **no** usa acceso amplio a fotos/vídeos.
   - Si solo aparece **Cámara**, justifica: *"La cámara se usa únicamente para que el usuario fotografíe su rutina de entrenamiento e importarla con IA. La galería usa el selector del sistema sin permiso READ_MEDIA."*

2. **Ficha → Seguridad de datos**
   - Revisa que no declares "Fotos y vídeos" como dato recopilado si ya no lees la galería con permiso amplio.

3. Sube un **nuevo AAB** (versionCode **12**, 1.1.5) generado después de este cambio.

## Texto sugerido para Cámara (≤250 caracteres, español)

La app usa la cámara solo cuando el usuario elige importar una rutina desde una foto. La imagen se envía a nuestro servidor para generar la rutina con IA. No accedemos a toda la galería; para elegir fotos existentes se usa el selector del sistema de Android.

## Probar en dispositivo

1. Rutina con IA → Desde foto/PDF → **Galería** (debe abrir selector, sin pedir "fotos y vídeos").
2. **Cámara** (debe pedir permiso de cámara la primera vez).
3. Importar PDF desde el selector de archivos sigue funcionando en web; en Android nativo usar galería/cámara.
