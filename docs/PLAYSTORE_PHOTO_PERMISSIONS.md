# Play Store — permisos de fotos y vídeos (rechazo)

## Qué pasó

Google rechazó la actualización por la **Política de permisos de fotos y vídeos**: el uso del permiso no está directamente relacionado con el objetivo principal de la app.

La app declaraba `READ_MEDIA_IMAGES` y `READ_EXTERNAL_STORAGE`, pero **no los necesita**.
Para desbloquear la primera publicación en producción, además se retiró la importación por imagen/cámara.

## Cambio en código (v1.1.6+)

- Eliminados `READ_MEDIA_IMAGES` y `READ_EXTERNAL_STORAGE` del manifiesto.
- Eliminado también `CAMERA` del manifiesto.
- Se fuerza `tools:node="remove"` por si alguna dependencia los fusionaba.
- Importación con IA ahora acepta solo `PDF/TXT`.

## Pasos en Play Console (obligatorio)

1. **Política → Contenido de la app → Permisos de fotos y vídeos**
   - Indica que la app **no** usa acceso amplio a fotos/vídeos.
   - Indica que la app no usa acceso a fotos/vídeos ni cámara.

2. **Ficha → Seguridad de datos**
   - Revisa que no declares "Fotos y vídeos" como dato recopilado si ya no lees la galería con permiso amplio.

3. Sube un **nuevo AAB** (versionCode **13**, 1.1.6) generado después de este cambio.

## Texto sugerido para la declaración (≤250 caracteres, español)

La app no solicita acceso amplio a fotos ni vídeos y tampoco usa la cámara en esta versión. La importación de rutinas con IA se realiza únicamente mediante archivos PDF o TXT seleccionados por el usuario.

## Probar en dispositivo

1. Rutina con IA → Desde PDF/TXT → seleccionar un PDF o TXT.
2. Confirmar que no aparece solicitud de permisos de fotos/vídeos ni cámara.
3. Completar importación y verificar que genera borrador de rutina.
