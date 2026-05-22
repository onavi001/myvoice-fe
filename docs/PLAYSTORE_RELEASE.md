# Play Store release — v1.1.1 (versionCode 8)

## Archivo AAB

```bash
npm run mobile:bundle:android:java21
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

## Versión

| Campo | Valor |
|-------|--------|
| `MV_VERSION_CODE` | 8 |
| `MV_VERSION_NAME` | 1.1.1 |

Definido en `android/gradle.properties`.

## Notas para la ficha de Play Console (español)

**Novedades de esta versión**

- Importa rutinas desde foto o PDF con IA.
- Formulario de rutina con IA más cómodo en móvil.
- Exporta tu rutina a PDF o texto.
- Regenera un ejercicio concreto con IA (con contexto del ejercicio actual).
- Progreso de rutina simplificado y colapsable (Hoy / Semana).
- Correcciones al iniciar sesión y al recargar la app.
- Corrección al abrir la sección de rutinas en blanco.

## Checklist antes de subir

- [ ] Backend en producción desplegado con los cambios de `myvoice-be` (import PDF/foto, generación de ejercicios).
- [ ] `VITE_API_BASE_URL` en `.env.production` apunta al API correcto (incluido en repo).
- [ ] Backend Vercel: `maxDuration` 60s, `GROQ_API_KEY`, `APP_URL` y opcional `CORS_ORIGINS` para tu dominio web.
- [ ] `android/keystore.properties` configurado (no se sube al repo).
- [ ] Probar login, listado de rutinas, importar rutina, exportar PDF y marcar ejercicios completados en dispositivo real.
- [ ] Generar AAB con el comando de arriba.
- [ ] En Play Console: crear release → subir `app-release.aab` → versionCode **8** → notas de versión.

## Backend

Desplegar `myvoice-be` en el mismo entorno que usa la app antes de publicar, para que funcionen:

- `POST /api/routines/generate-from-import`
- `POST /api/exercises/generate` (body con ejercicio a reemplazar)
- `GET /api/auth/verify` sin rate limit estricto
- CORS restringido + timeouts Groq alineados con Vercel (55s visión)
