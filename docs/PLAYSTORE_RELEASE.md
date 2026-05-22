# Play Store release — v1.1.3 (versionCode 10)

## Archivo AAB

```bash
npm run mobile:bundle:android:java21
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

## Versión

| Campo | Valor |
|-------|--------|
| `MV_VERSION_CODE` | 10 |
| `MV_VERSION_NAME` | 1.1.3 |

Definido en `android/gradle.properties`.

## Notas para la ficha de Play Console (español)

**Novedades de esta versión**

- Corrige anuncios que tapaban botones (guardar rutina, chat y modo entrenamiento).
- Al cerrar un anuncio, el espacio en pantalla se libera correctamente.

## Checklist antes de subir

- [ ] Backend en producción desplegado (`myvoice-be` en Vercel).
- [ ] `VITE_API_BASE_URL` en `.env.production` apunta al API correcto.
- [ ] `android/keystore.properties` configurado (no se sube al repo).
- [ ] Probar botones inferiores con banner visible y tras cerrar el anuncio.
- [ ] Generar AAB con el comando de arriba.
- [ ] En Play Console: subir `app-release.aab` → versionCode **10** → notas de versión.
