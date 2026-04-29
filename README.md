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

3. Abrir app en:

`http://localhost:5173`

> Nota: el proxy de Vite ya redirige `/api` hacia `http://localhost:4000` (ver `vite.config.ts`).

## Scripts disponibles

- `npm run dev`: servidor local de desarrollo.
- `npm run host`: servidor accesible en red local.
- `npm run build`: compilación TypeScript + build de Vite.
- `npm run preview`: vista previa del build.
- `npm run lint`: lint de código.

## Estructura del proyecto

```text
src/
  components/      # Componentes UI reutilizables y módulos de features
  pages/           # Pantallas/rutas principales
  hooks/           # Hooks de composición y lógica compartida
  store/           # Redux store, slices y helpers de estado async
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
- **Datos remotos:** `createAsyncThunk` para llamadas a backend.
- **Navegación:** rutas protegidas por autenticación/rol.
- **UI responsive:** base mobile-first y ajustes `sm/md/lg`.

## Calidad y mantenimiento

- Lint obligatorio antes de merge.
- Tipado fuerte con TypeScript.
- Estado serializable en Redux (fechas normalizadas a string ISO).
- Convención de errores con payload tipado en thunks.

## Seguridad y configuración

- No subir secretos en commits.
- Revisar periódicamente dependencias.
- Para producción, definir variables y endpoints por entorno.

## Estado actual del proyecto

El frontend incluye mejoras recientes en:

- consistencia de estado async (`status/loading/error`),
- UX mobile-first en edición de rutina,
- metadata dinámica de SEO por ruta,
- compatibilidad de `<Helmet>` con Strict Mode.
