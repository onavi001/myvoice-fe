# Play Store release — v1.1.5 (versionCode 12)

## Archivo AAB

```bash
npm run mobile:bundle:android:java21
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

## Versión

| Campo | Valor |
|-------|--------|
| `MV_VERSION_CODE` | 12 |
| `MV_VERSION_NAME` | 1.1.5 |

Definido en `android/gradle.properties`.

## Notas para la ficha de Play Console (español)

**Novedades de esta versión**

- Cumple la política de permisos de fotos: sin acceso amplio a la galería; selector del sistema para elegir imágenes.
- Botones más compactos al crear y editar rutinas en móvil.
- Mejoras del temporizador de ejercicio y correcciones generales.

## Si Google rechazó por permisos de fotos

Ver **`docs/PLAYSTORE_PHOTO_PERMISSIONS.md`** y actualizar la declaración en Play Console antes de volver a enviar.

## Checklist antes de subir

- [ ] Backend en producción (`myvoice-be` en Vercel).
- [ ] `.env.production`: `VITE_API_BASE_URL` y AdMob (`VITE_ADMOB_TESTING=false`).
- [ ] Play Console: permisos de fotos/vídeos actualizados (sin READ_MEDIA).
- [ ] Probar galería y cámara en importar rutina (dispositivo real).
- [ ] Generar AAB y subir → versionCode **12**.
