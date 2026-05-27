# Play Store release — v1.1.6 (versionCode 13)

## Archivo AAB

```bash
npm run mobile:bundle:android:java21
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

## Versión

| Campo | Valor |
|-------|--------|
| `MV_VERSION_CODE` | 13 |
| `MV_VERSION_NAME` | 1.1.6 |

Definido en `android/gradle.properties`.

## Notas para la ficha de Play Console (español)

**Novedades de esta versión**

- Importación IA simplificada: ahora solo admite PDF/TXT (sin imágenes/cámara) para evitar bloqueos de política.
- Se eliminan los permisos y flujos relacionados con imágenes en Android.
- Botones más compactos al crear y editar rutinas en móvil.
- Mejoras del temporizador de ejercicio y correcciones generales.

## Si Google rechazó por permisos de fotos

Ver **`docs/PLAYSTORE_PHOTO_PERMISSIONS.md`** y actualizar la declaración en Play Console antes de volver a enviar.

## Checklist antes de subir

- [ ] Backend en producción (`myvoice-be` en Vercel).
- [ ] `.env.production`: `VITE_API_BASE_URL` y AdMob (`VITE_ADMOB_TESTING=false`).
- [ ] Play Console: permisos de fotos/vídeos actualizados (sin READ_MEDIA / sin cámara).
- [ ] Probar importar rutina con PDF/TXT en dispositivo real.
- [ ] Generar AAB y subir → versionCode **13**.
