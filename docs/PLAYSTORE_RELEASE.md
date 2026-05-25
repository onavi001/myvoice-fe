# Play Store release — v1.1.4 (versionCode 11)

## Archivo AAB

```bash
npm run mobile:bundle:android:java21
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

## Versión

| Campo | Valor |
|-------|--------|
| `MV_VERSION_CODE` | 11 |
| `MV_VERSION_NAME` | 1.1.4 |

Definido en `android/gradle.properties`.

## Notas para la ficha de Play Console (español)

**Novedades de esta versión**

- Banner de anuncios arriba para no tapar botones inferiores.
- Temporizador de ejercicio mejorado: avisos sonoros por fase (serie, descanso, fin) sin voz.
- Modo entrenamiento: timer a pantalla completa y detalle completo del ejercicio.
- Correcciones de estabilidad en rutinas y modo entrenamiento.

## Checklist antes de subir

- [ ] Backend en producción (`myvoice-be` en Vercel) con `GROQ_API_KEY`.
- [ ] `.env.production`: `VITE_API_BASE_URL` y AdMob real (`VITE_ADMOB_*`, `VITE_ADMOB_TESTING=false`).
- [ ] `android/keystore.properties` configurado.
- [ ] Probar login, rutinas, modo entrenamiento, timer y anuncios en dispositivo real.
- [ ] Generar AAB y subir a Play Console → versionCode **11**.
