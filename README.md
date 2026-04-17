# MyVoice Frontend

Frontend de la aplicación MyVoice, construido con React, TypeScript y Vite.

## Scripts principales

- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Compila la app para producción
- `npm run preview` — Previsualiza el build
- `npm run lint` — Linting del código

## Estructura del proyecto

- `src/components/` — Componentes reutilizables y específicos
- `src/pages/` — Páginas principales de la app
- `src/hooks/` — Hooks personalizados
- `src/store/` — Slices de Redux y gestión de estado global
- `src/models/` — Tipos y modelos TypeScript
- `src/utils/` — Utilidades generales (incluye helpers de accesibilidad)

## Accesibilidad

- Todos los botones, inputs y modales incluyen roles y aria-labels para accesibilidad.
- Usa helpers de `src/utils/a11y.ts` para roles y etiquetas.

## Optimización de performance

- Componentes clave (Button, Input, Textarea, Modal) usan `React.memo` para evitar renders innecesarios.
- Se recomienda usar `React.lazy` y `Suspense` para lazy loading de páginas/modales pesados.

## Buenas prácticas

- Mantén la lógica de negocio fuera de los componentes y centralizada en hooks/slices.
- Usa feedback visual (loaders, mensajes) en todas las acciones asíncronas.
- Valida formularios y entradas de usuario.

## Contribución

1. Haz fork y clona el repo
2. Instala dependencias: `npm install`
3. Usa ramas para nuevas features o fixes
4. Haz PRs claros y documentados

---
Proyecto mantenido por el equipo MyVoice.
