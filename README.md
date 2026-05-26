<div align="center">

# КВАНТОВОЕ ЯДРО

**Lumina Quantum** · машина, считающая реальность

[Demo](#) · [Tech](#стек) · [Запуск](#запуск)

</div>

---

Кинематографический одностраничник про квантовый процессор-«люстру». Скролл прокатывает камеру сквозь раскрывающееся ядро — узлы расходятся в тоннель, камера ныряет внутрь, всё собирается обратно и встаёт на орбиту.

Никаких CMS, никаких header-шаблонов — всё рендерится в один Canvas, всё привязано к одному скролл-таймлайну.

## Стек

| Слой | Технология |
| --- | --- |
| Framework | Next.js 16 · React 19 · App Router |
| 3D | three.js · @react-three/fiber · @react-three/drei |
| PostFX | @react-three/postprocessing (Bloom · Vignette) |
| Скролл | Lenis · GSAP ScrollTrigger |
| Стили | Tailwind v4 (`@theme inline`) |
| Шейдеры | сырые GLSL: simplex 3D, plasma, warp streaks, energy arcs |

## Архитектура сцены

```
QuantumScene
  ├─ CameraRig         — единственный «писатель» камеры, ведёт скролл
  ├─ Starfield         — фон, ~1.8K точек
  ├─ QuantumChandelier
  │   ├─ CoreOrb           — ядро, IcosahedronGeometry + simplex noise
  │   ├─ PlasmaRings       — 4 ShaderMaterial-кольца
  │   ├─ QubitLattice      — InstancedMesh, 150 узлов, lerp sphere↔helix
  │   ├─ ChandelierCrystals — InstancedMesh, 50 кристаллов, emissive
  │   ├─ EnergyStreams     — 280 GPU-частиц, орбитальная анимация
  │   ├─ WarpStreaks       — 200 streaks, видны только во время полёта
  │   └─ EnergyArcs        — 4 молнии × 12 сегментов, регенерация раз в 95ms
  └─ PostFX            — Bloom + Vignette, без Noise, без CA (флика нет)
```

Состояние скролла лежит в `lib/scroll/scrollStore.ts` — модульный singleton. Никаких React-rerenders из useFrame.

Нарратив разбит на 5 фаз (`lib/scroll/narrativePhases.ts`): IDLE → EXPLODE → FLYTHROUGH → REASSEMBLE → RESOLVE. Каждая часть chandelier подписана на `scrollStore.smooth` и интерполирует своё положение независимо.

Камера идёт по `CatmullRomCurve3` (centripetal) с 11 waypoints, банкуется через `camera.up`, FOV эволюционирует bell-curve через тоннель.

## Запуск

```bash
npm install
npm run dev
```

Откроется на `http://localhost:3000`. Скролл от верха до низа = вся история.

## Production

```bash
npm run build
npm start
```

## Структура

```
app/
  layout.tsx            — Lenis + global font + metadata
  page.tsx              — Canvas + sections
  globals.css           — Tailwind v4 theme
  opengraph-image.tsx   — edge-rendered OG card
  sitemap.ts · robots.ts
components/
  canvas/               — всё что в 3D
  sections/             — Hero, About, Technology, Capabilities, Roadmap, Community
  ui/                   — SideRail, TopBar, LoaderOverlay, CustomCursor
  providers/            — LenisProvider
lib/
  scroll/               — scrollStore, narrativePhases, cameraPath
  three/                — colors, performance tier detection
```

## Производительность

- Один Canvas, frameloop останавливается при `document.hidden`
- InstancedMesh для всего что повторяется
- Vertex-shader motion вместо CPU per-frame
- MSAA = 0, antialias = false (Bloom + Vignette достаточно)
- Tier detection: high / mid / low — постфакс и количество элементов адаптивны

## Лицензия

MIT.
