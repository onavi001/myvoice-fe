# Play Store release — v1.1.2 (versionCode 9)

## Archivo AAB

```bash
npm run mobile:bundle:android:java21
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

## Versión

| Campo | Valor |
|-------|--------|
| `MV_VERSION_CODE` | 9 |
| `MV_VERSION_NAME` | 1.1.2 |

Definido en `android/gradle.properties`.

## Notas para la ficha de Play Console (español)

**Novedades de esta versión**

- Modo entrenamiento a pantalla completa con el mismo detalle que cada ejercicio (videos, consejos, campos y guardar).
- Racha por sesiones planificadas y banner de qué entrenar hoy.
- Plantillas de rutina (cuerpo completo, PPL, upper/lower).
- Límites freemium en generar/importar/regenerar con IA (Pro simulable en desarrollo).
- Recordatorios locales Lun/Mié/Vie en la app Android.
- Progreso colapsable con barras Hoy/Semana y pistas de progresión.
- Mejoras de estabilidad al iniciar sesión y al abrir rutinas.

## Checklist antes de subir

- [ ] Backend en producción desplegado (`myvoice-be` en Vercel).
- [ ] `VITE_API_BASE_URL` en `.env.production` apunta al API correcto.
- [ ] Backend Vercel: `maxDuration` 60s, `GROQ_API_KEY`, `APP_URL` y opcional `CORS_ORIGINS`.
- [ ] `android/keystore.properties` configurado (no se sube al repo).
- [ ] Probar modo entrenamiento, marcar ejercicios, plantillas y login en dispositivo real.
- [ ] Generar AAB con el comando de arriba.
- [ ] En Play Console: crear release → subir `app-release.aab` → versionCode **9** → notas de versión.

## Backend

Desplegar `myvoice-be` en el mismo entorno que usa la app antes de publicar, para que funcionen:

- `POST /api/routines/generate-from-import`
- `POST /api/exercises/generate` (body con ejercicio a reemplazar)
- `GET /api/auth/verify` sin rate limit estricto
- CORS restringido + timeouts Groq alineados con Vercel (55s visión)
