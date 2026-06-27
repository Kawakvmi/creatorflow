# CreatorFlow — Design System MASTER

> Global Source of Truth. Page-specific overrides live in `design-system/pages/<page>.md`.
> Stack: **Next.js 14 · TypeScript · Tailwind CSS 3 · shadcn/ui · Framer Motion · Recharts · Supabase**
> Locale: **pt-BR**

---

## 1. Product Identity

| Attribute     | Value                                                          |
|---------------|----------------------------------------------------------------|
| Product type  | SaaS Productivity — content production management for creators |
| Target users  | Digital content creators (video, design, games, identity)     |
| Tone          | Professional yet creative; focused, dark-first, polished      |
| Pattern       | Dark glassmorphism SaaS dashboard                             |

---

## 2. Color System

### Primary Brand
| Token            | Value          | Usage                                      |
|------------------|----------------|--------------------------------------------|
| `primary`        | `violet-500`   | CTAs, active nav, focus rings, gradients   |
| `primary-deep`   | `purple-600`   | Gradient end, shadows, logo                |
| `primary-light`  | `violet-400`   | Dark mode text accents, active indicators  |
| `primary-shadow` | `violet-500/25`| Box shadows on primary elements            |

Primary gradient: `from-violet-500 to-purple-600` (135°)  
Logo gradient: `from-violet-500 via-purple-500 to-fuchsia-500`

### Semantic Colors
| Role         | Light token          | Dark token              | Usage                      |
|--------------|----------------------|-------------------------|----------------------------|
| Error / Late | `red-500`            | `red-400`               | Overdue deadlines, errors  |
| Warning      | `amber-500`          | `amber-400`             | Deadlines, medium priority |
| Success      | `emerald-500`        | `emerald-400`           | Published, completed       |
| Info         | `sky-500`            | `sky-400`               | Review stage, info badges  |

### Stage Colors (Kanban)
| Stage       | Color            | Hex       |
|-------------|------------------|-----------|
| script      | violet           | `#8b5cf6` |
| narration   | blue             | `#3b82f6` |
| art         | pink             | `#ec4899` |
| editing     | amber            | `#f59e0b` |
| review      | sky              | `#0ea5e9` |
| published   | emerald          | `#10b981` |

### Content Type Gradients
| Type         | Gradient                          |
|--------------|-----------------------------------|
| video        | `from-violet-500 to-purple-600`   |
| presentation | `from-sky-500 to-blue-600`        |
| game         | `from-emerald-500 to-teal-600`    |
| layout       | `from-pink-500 to-rose-600`       |
| site         | `from-cyan-500 to-sky-600`        |
| identity     | `from-fuchsia-500 to-pink-600`    |

### Surfaces (Dark mode — primary mode)
| Surface level         | Tailwind class                               |
|-----------------------|----------------------------------------------|
| Page background       | `bg-zinc-950` or `bg-background`             |
| Card / panel          | `bg-white/[0.04]` + `backdrop-blur-xl`       |
| Input / select        | `bg-white/[0.06]` + `backdrop-blur-sm`       |
| Hover state           | `bg-white/[0.07]` or `bg-white/[0.08]`       |
| Divider               | `border-white/[0.06]` or `border-white/[0.08]` |
| Modal backdrop        | `bg-zinc-900/90` + `backdrop-blur-2xl`       |
| Overlay/scrim         | `bg-black/65` + `backdrop-blur-md`           |

### Surfaces (Light mode)
| Surface level         | Tailwind class                               |
|-----------------------|----------------------------------------------|
| Page background       | `bg-zinc-50` or `bg-background`              |
| Card / panel          | `bg-white` or `bg-zinc-100/70`               |
| Border                | `border-zinc-200`                            |
| Sidebar               | `bg-zinc-50`                                 |

---

## 3. Typography

### Font Stack
| Role     | Font    | Variable          | Weights     |
|----------|---------|-------------------|-------------|
| Primary  | Inter   | `--font-sans`     | 400 500 600 700 |
| Mono     | (none)  | system mono       | 400         |

### Type Scale
| Role            | Size     | Weight | Line-height | Usage                    |
|-----------------|----------|--------|-------------|--------------------------|
| Page title      | `text-3xl` | 700  | tight       | Dashboard h1             |
| Section heading | `text-sm`  | 600  | snug        | Card section headers     |
| Body            | `text-sm`  | 400  | normal      | Primary content text     |
| Muted body      | `text-xs`  | 400  | normal      | Secondary info, subtitles|
| Label           | `text-xs`  | 500  | normal      | Form labels              |
| Micro / badge   | `text-[10px]` | 500–600 | none  | Stage badges, priority   |
| Overline        | `text-[10px]` | 600  | —          | Section labels (uppercase tracking-wider) |

### Label convention
Form labels: `text-xs font-medium text-white/60 uppercase tracking-wider`

---

## 4. Spacing & Layout

### Grid & Containers
- Page max-width: `max-w-7xl mx-auto`
- Page padding: `p-6 md:p-8`
- Section gap: `space-y-8`
- Card padding: `p-5` (header) · `p-4`–`p-6` (body)
- Sidebar width: `w-64` (256px)

### Spacing Scale (8dp rhythm)
`gap-2` · `gap-3` · `gap-4` · `gap-5` · `p-3.5` · `p-4` · `p-5` · `p-6` · `p-8`

### Breakpoints
| Breakpoint | Width  | Layout change                          |
|------------|--------|----------------------------------------|
| default    | <640px | Single column, bottom nav              |
| `sm:`      | 640px  | 2-column KPI grid                      |
| `lg:`      | 1024px | Sidebar visible, 4-column KPI grid     |

---

## 5. Border Radius
| Token        | Value  | Usage                                       |
|--------------|--------|---------------------------------------------|
| `rounded-lg` | 8px    | Small elements: badges, checklist items     |
| `rounded-xl` | 12px   | Inputs, buttons, small cards, nav items     |
| `rounded-2xl`| 16px   | Main cards, modals, KPI cards               |
| `rounded-full`| 50%   | Avatars, dot indicators, spinners           |

---

## 6. Shadows & Elevation
| Level    | Class                                       | Usage                   |
|----------|---------------------------------------------|-------------------------|
| Low      | `shadow-sm`                                 | Icon backgrounds        |
| Medium   | `shadow-md`                                 | Nav icons               |
| High     | `shadow-lg`                                 | Cards, buttons          |
| Extra    | `shadow-xl shadow-black/20`                 | Glass panels            |
| Glow     | `shadow-violet-500/25`                      | Primary CTAs            |
| Modal    | `shadow-2xl shadow-black/60`                | Modals                  |

---

## 7. Component Patterns

### GlassCard (primary panel)
```tsx
<div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/20">
```

### KPI Card
- `rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl`
- Colored 2px top border: `h-0.5 w-full bg-gradient-to-r ${gradient}`
- Glow corner: `absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl`
- Hover: `hover:border-white/[0.14]` + glow `group-hover:opacity-20`

### Icon Background
```tsx
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
  <Icon className="w-4 h-4 text-white" />
</div>
```
Sizes: `w-8 h-8` (small) · `w-9 h-9` (medium) · `w-12 h-12` (large KPI)

### Primary CTA Button
```tsx
className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all"
```

### Secondary Button
```tsx
className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
```

### Input / Select
```tsx
className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 backdrop-blur-sm"
```

### Stage Badge
```tsx
style={{ borderColor: `${STAGE_COLORS[stage]}35`, color: STAGE_COLORS[stage], backgroundColor: `${STAGE_COLORS[stage]}12` }}
className="text-[10px] px-2 py-0.5 rounded-md border font-medium"
```

### Priority Badge
```
low:    "text-sky-400 border-sky-500/30 bg-sky-500/10"
medium: "text-amber-400 border-amber-500/30 bg-amber-500/10"
high:   "text-red-400 border-red-500/30 bg-red-500/10"
```

### Late / Date Badge
```
late:    "text-red-400 border-red-500/30 bg-red-500/10"
normal:  "text-white/40 border-white/[0.08] bg-white/[0.04]"
```

---

## 8. Navigation

### Desktop Sidebar
- Width: `w-64` · Background: `bg-zinc-950` dark / `bg-zinc-50` light
- Active item: `text-violet-300 bg-violet-500/[0.12] border border-violet-500/[0.20]` + left 2px accent bar
- Inactive item: `text-white/45 hover:text-white/85 hover:bg-white/[0.05]`
- Logo mark: `w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600`
- Nav items: Dashboard, Campanhas, Calendário, Configurações

### Mobile Bottom Nav
- 4 items max (matches sidebar nav items)
- Position: fixed bottom with safe area padding

---

## 9. Animation (Framer Motion)

### Timing Tokens
| Type           | Duration  | Easing                  | Usage                       |
|----------------|-----------|-------------------------|-----------------------------|
| Micro          | 150–200ms | `ease-out`              | Hover states, opacity       |
| Standard       | 250–300ms | `[0.16, 1, 0.3, 1]`    | Modal open, card entrance   |
| Exit           | 180–200ms | `ease-in`               | Modal close, fade out       |
| Stagger        | 35–70ms   | per item                | List items, KPI cards       |
| Progress bar   | 1000ms    | `easeOut` + delay 300ms | Campaign progress bars      |

### Standard Modal
```tsx
initial={{ opacity: 0, scale: 0.9, y: 24 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.93, y: 12 }}
transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
```

### List Item Entrance
```tsx
initial={{ opacity: 0, x: -8 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: i * 0.035, duration: 0.3 }}
```

### KPI Card Entrance
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.07, duration: 0.4 }}
```

### Reduced motion: always wrap Framer Motion with `useReducedMotion()` or use `AnimatePresence` with short fallbacks.

---

## 10. Page Background Decoration

Standard page background gradient (dark):
```tsx
style={{
  background: `
    radial-gradient(ellipse 70% 45% at 50% 0%, rgba(109,40,217,0.13) 0%, transparent 65%),
    radial-gradient(ellipse 35% 30% at 100% 80%, rgba(79,70,229,0.07) 0%, transparent 60%)
  `
}}
```

Sidebar top glow:
```tsx
style={{ background: "radial-gradient(ellipse 80% 60% at 30% 0%, rgba(109,40,217,0.14) 0%, transparent 70%)" }}
```

---

## 11. Forms & Validation

- Labels: `text-xs font-medium text-white/60 uppercase tracking-wider`
- Required marker: `*` in red, or note `(opcional)` for optional fields
- Error display: below the field, `text-red-400`
- Disabled: `disabled:opacity-60`
- Submit loading: spinner `w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin`
- Sheet/modal unsaved changes: confirm before close (Escape key handled)

---

## 12. Icons

Library: **Lucide React** (`lucide-react`)  
Style: stroke, consistent 1.5–2px stroke width  
Sizes: `w-3 h-3` (micro) · `w-3.5 h-3.5` · `w-4 h-4` (standard) · `w-5 h-5` · `w-6 h-6` (KPI)  
**Never use emojis as icons in UI structure.** Use option labels only for `<select>` options where SVG is not available.

---

## 13. Charts (Recharts)

- Library: `recharts`
- Primary chart: Donut/Pie with SVG `linearGradient` fills
- Tooltip style: `borderRadius: 12px, border: 1px solid rgba(255,255,255,0.08), background: rgba(24,24,27,0.95), backdropFilter: blur(8px)`
- Legend: `verticalAlign: bottom, iconType: circle, iconSize: 7`
- Active shape: expand `outerRadius + 9`, shrink `innerRadius - 3`, `cornerRadius: 8`
- Empty state: centered text, no blank axes

---

## 14. Anti-Patterns

- **Do not** use emojis as structural UI icons
- **Do not** use raw hex in className — use Tailwind tokens or CSS variables
- **Do not** mix rounded values outside the 4-token scale (lg/xl/2xl/full)
- **Do not** use fixed px widths for containers — use max-w-* classes
- **Do not** animate `width` or `height` — use `transform` / `opacity` / `scale`
- **Do not** create hover-only interactions without touch alternatives
- **Do not** place touch targets below 44×44px without hitSlop/padding
- **Do not** use `100vh` — use `min-h-dvh` for mobile viewport safety
- **Do not** add blocking animations that prevent user input
- **Do not** omit `aria-label` on icon-only buttons

---

## 15. Accessibility Baseline

- Focus rings: `focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50`
- Keyboard: Escape closes modals (implemented via `keydown` listener)
- Color contrast: primary violet on dark bg ≥ 4.5:1 (verify with each new palette)
- Aria: `aria-label` required on all icon-only interactive elements
- Screen reader: use `aria-live="polite"` for toast notifications
- Loading states: spinner + `disabled` on async buttons (no bare UI freezes)
