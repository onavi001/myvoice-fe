# MyVoice Frontend

Aplicación cliente de MyVoice para usuarios, coaches y administración.
Permite crear/editar rutinas, registrar progreso, visualizar métricas y consumir la API del backend.

## Propósito de la aplicación

MyVoice es una plataforma de entrenamiento enfocada en:

- gestión de rutinas personalizadas,
- seguimiento de progreso por ejercicio y calendario,
- soporte a flujos coach-cliente,
- generación asistida por IA para rutinas/ejercicios,
- experiencia mobile-first con soporte PWA.

## Stack técnico

- React 19 + TypeScript
- Redux Toolkit (estado global)
- React Router
- Vite 6
- Tailwind CSS 4
- Framer Motion
- Chart.js
- Vite PWA

## Requisitos

- Node.js 18+
- npm 9+
- Backend MyVoice corriendo en `http://localhost:4000`

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Levantar entorno de desarrollo:

```bash
npm run dev
```

Configura tus variables de entorno locales antes de levantar la app:

```bash
cp .env.example .env
```

3. Abrir app en:

`http://localhost:5173`

> Nota: el proxy de Vite ya redirige `/api` hacia `http://localhost:4000` (ver `vite.config.ts`).
> Para build móvil con Capacitor, define `VITE_API_BASE_URL` apuntando a tu API pública.

## Scripts disponibles

- `npm run dev`: servidor local de desarrollo.
- `npm run host`: servidor accesible en red local.
- `npm run build`: compilación TypeScript + build de Vite.
- `npm run preview`: vista previa del build.
- `npm run lint`: lint de código.
- `npm run cap:sync`: sincroniza assets web con plataformas nativas.
- `npm run cap:open:android`: abre proyecto Android Studio.
- `npm run cap:open:ios`: abre proyecto iOS en Xcode.
- `npm run mobile:build:android`: build web + sync Android.
- `npm run mobile:build:ios`: build web + sync iOS.

## Capacitor para producción

1. Asegura una API pública HTTPS en `VITE_API_BASE_URL`.
2. Genera build y sincroniza:

```bash
npm run mobile:build:android
```

o

```bash
npm run mobile:build:ios
```

3. Abre el proyecto nativo (`cap:open:*`) y genera el release firmado desde Android Studio/Xcode.

### Icono y splash (Android)

La fuente está en `assets/logo.png` (hoy es una copia de `public/android-chrome-512x512.png`). Para regenerar launcher + splash después de cambiar el logo:

```bash
npm run assets:android
```

Luego vuelve a compilar/sincronizar (`npm run mobile:build:android` o tu flujo de release).

## Android Play Store (AAB)

1. Crea un keystore de release (solo una vez):

```bash
mkdir -p keystores
keytool -genkey -v -keystore keystores/myvoice-release.keystore -alias myvoice -keyalg RSA -keysize 2048 -validity 10000
```

2. Crea archivo de firma:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Luego reemplaza `storePassword` y `keyPassword` con tus valores reales. El `storeFile` es relativo a la carpeta `android/` (no a `android/app/`); la plantilla apunta al keystore típico en `keystores/myvoice-release.keystore` del repo.

3. Incrementa versión para cada release en `android/gradle.properties`:

```properties
MV_VERSION_CODE=7
MV_VERSION_NAME=1.1.0
```

4. Genera bundle para Play Store (Capacitor 8 necesita JDK 21 para compilar `:capacitor-android`):

```bash
brew install openjdk@21
npm run mobile:bundle:android:java21
```

Si ya tienes JDK 21 bien registrado en macOS (`/usr/libexec/java_home -v 21`), puedes usar `npm run mobile:bundle:android`. En Mac con Homebrew, OpenJDK suele **no** aparecer ahí y entonces Gradle sigue con Java 17: por eso el script `:java21` busca también `brew --prefix openjdk@21`.

5. Toma el archivo final en:

`android/app/build/outputs/bundle/release/app-release.aab`

## Estructura del proyecto

```text
src/
  components/      # Componentes UI reutilizables y módulos de features
  pages/           # Pantallas/rutas principales
  hooks/           # Hooks de composición y lógica compartida
  store/           # Redux store, slices, selectors memoizados y helpers async
  models/          # Tipos/interfaces de dominio
  utils/           # Helpers generales (a11y, utilidades)
  docs/            # Documentación interna (auditorías, notas)
  App.tsx          # Routing principal + providers
  main.tsx         # Punto de entrada React
  index.css        # Estilos globales/tokens
```

## Arquitectura frontend

- **Presentación:** componentes + páginas.
- **Estado global:** slices en Redux Toolkit (`routine`, `progress`, `user`, `coach`, `userManagement`).
- **Derivados memoizados:** selectors en `store/selectors.ts` para rutinas/progreso.
- **Datos remotos:** `createAsyncThunk` para llamadas a backend.
- **Navegación:** rutas protegidas por autenticación/rol.
- **UI responsive:** base mobile-first y ajustes `sm/md/lg`.
- **Composición por hooks:** controladores de pantalla (`useRoutinePageController`, `useProgressViewModel`, etc.) para separar UI de lógica.

## Calidad y mantenimiento

- Lint obligatorio antes de merge.
- Tipado fuerte con TypeScript.
- Estado serializable en Redux (fechas normalizadas a string ISO).
- Convención de errores con payload tipado en thunks.

## Seguridad y configuración

- No subir secretos en commits.
- Revisar periódicamente dependencias.
- Para producción, definir variables y endpoints por entorno.
- Politica de privacidad publicada en `/privacy-policy.html`.

## Estado actual del proyecto

El frontend incluye mejoras recientes en:

- consistencia de estado async (`status/loading/error`),
- UX mobile-first en edición de rutina,
- metadata dinámica de SEO por ruta,
- compatibilidad de `<Helmet>` con Strict Mode.

## Validación manual (estado)

Se completó una validación manual end-to-end de los flujos principales:

- autenticación (`login/logout` y persistencia de sesión),
- CRUD de rutinas/días/ejercicios,
- CRUD de progreso,
- flujos principales de coach/admin.
