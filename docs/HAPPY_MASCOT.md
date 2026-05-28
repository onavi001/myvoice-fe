# Happy — mascota coach de My Voice

Happy es el perro real del proyecto, estilizado como **mascota plana tipo Duolingo**: contornos gruesos, colores planos, cuerpo **atlético/musculado**, coach serio pero amigable (no fotorrealista).

## Personalidad

- Directo, motivador, sin exagerar emojis.
- Celebra logros con frases cortas.
- No aparece durante el timer activo (solo al terminar series).

## Variantes visuales

| Variante    | Uso                                      |
|------------|-------------------------------------------|
| `idle`     | Estados vacíos, bienvenida                |
| `encourage`| “¿Qué entreno hoy?”, recordatorios        |
| `celebrate`| Racha, fin de ejercicio / sesión          |

## Colores

- Negro lomo/cabeza: `#1E1E1E`
- Tan patas/pecho/hocico/cejas: `#C9A66B`
- Arnés marca: `#34C759`

## Implementación

- `public/assets/happy/happy-coach-idle.png` — mascota plana fitness (coach)
- `public/assets/happy/happy-coach-celebrate.png` — variante logro / flex
- `src/components/mascot/HappyCoachIllustration.tsx` — composición + SVG fallback si falla la carga
- `src/components/mascot/HappyCoachStage.tsx` — raster + overlays (parpadeo, cola, brazos, tap)
- `src/components/mascot/index.ts` — re-export de utilidades de animación reutilizables
- `src/components/mascot/HappyCoach.tsx` — layout + mensaje
- `src/components/mascot/happyCoachCopy.ts` — textos

Animación (prop `animated` en `HappyCoach`):

| Efecto | Variantes | Prop |
|--------|-----------|------|
| Parpadeo aleatorio | idle, encourage, celebrate | `animated` |
| Cola | celebrate | `animated` |
| Flex brazos | celebrate | `animated` |

Archivos: `happyCoachMotion.ts`, `happyCoachLayout.ts`, `HappyCoachStage.tsx`, `useHappyCoachBlink.ts`.

## Cómo mejorar aún más el look

1. **Ilustrador** — Brief con fotos reales de Happy; export PNG/WebP @1x/@2x y opcional Lottie.
2. **Reemplazar assets** — Mismos nombres en `public/assets/happy/` (sin cambiar código).
3. **Variante `encourage`** — Añadir `happy-coach-encourage.png` y mapearla en `happyCoachAssets.ts`.
4. **Fondo** — PNG con transparencia real (`rembg` / u2net). No usar recorte por color: el negro del pelaje y el fondo son el mismo tono. Regenerar: `python3 scripts/process-happy-assets.py` (requiere `pip install rembg onnxruntime pillow`).

Referencias de estilo: **Duolingo** (plano, contorno, ojos grandes), cuerpo **fit/músculos cartoon**, arnés verde marca, cejas tan de Happy.

## Pantallas

- `RoutineEmpty`
- `TodayWorkoutBanner`
- `RoutineProgressSummary` (racha)
- `WorkoutMode` (día 100 %)
- `Timer` (fin de series)
