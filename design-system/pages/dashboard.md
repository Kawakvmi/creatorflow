# Dashboard Page — Design Overrides

> Inherits from `design-system/MASTER.md`. Only deviations are listed here.

## Layout
- 4-column KPI grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- Middle row: 3 equal columns on `lg:` (chart + deadlines + campaigns)
- Active demands list: full-width GlassCard with internal list

## Unique Components

### Page Background
Double radial gradient (violet top-center + indigo bottom-right) — see MASTER §10.

### KPI Cards
- Colored gradient top border (`h-0.5`)
- Glow corner element (`absolute -top-6 -right-6 w-24 h-24 opacity-10 blur-2xl`)
- Entrance animation: stagger `delay: i * 0.07`

### Active Demands List
- Row: `flex items-center gap-3 px-5 py-3.5`
- Campaign dot → Type icon → Title/Campaign → Stage badge → Priority badge → Date badge → ChevronRight
- `ChevronRight` hidden by default, reveals on hover with `group-hover:opacity-100`
- Row hover: `hover:bg-white/[0.04]`

### Quick Demand Button (header CTA)
- Shimmer hover: `via-white/15 -translate-x-full group-hover:translate-x-full duration-500`
- Contains: `Plus` icon + text + `Sparkles` icon

### Donut Chart
- SVG `linearGradient` fills per stage (defined in `<defs>`)
- Active shape: expand outer by 9, shrink inner by 3, cornerRadius 8
- Tooltip: dark glass style (see MASTER §13)

### Campaign Progress Bars
- Animated via Framer Motion: `initial={{ width: 0 }} → animate={{ width: '${p}%' }}`
- `duration: 1, ease: "easeOut", delay: 0.3`
- Color matches campaign `.color` property

## Empty States
All empty states: centered icon (emerald CheckCircle2 at 50% opacity) + muted text + ghost action button.
