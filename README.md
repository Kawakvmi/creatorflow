# CreatorFlow

> A production management system for content creators — built as a portfolio project.

**UI language: Portuguese (BR)** — built this way intentionally for the target audience of the demo dataset. All code, types, and enums are in English.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-purple?logo=framer)

---

## What is CreatorFlow?

CreatorFlow is a client-side SaaS-style web app that helps content creators manage the production of videos, presentations, and indie games. Think of it as a Kanban + Editorial Calendar + Brainstorm notebook, all in one.

Built entirely with local storage and IndexedDB — no backend, no auth service, no API keys required.

---

## Features

| Feature | Description |
|---|---|
| **Kanban Board** | Drag-and-drop cards across 6 production stages (Script → Published) |
| **Card Detail** | Inline editing, per-type checklists, approval workflow, Guidebook |
| **Guidebook / Brainstorm** | Per-card notebook: text blocks + image blocks (click, paste, drag-drop) stored in IndexedDB |
| **Editorial Calendar** | Monthly view with clickable cards, late-deadline highlighting |
| **Dashboard** | KPI cards, Recharts donut chart, deadline list, campaign progress bars |
| **Campaigns** | Colored, icon-tagged project groups with progress tracking |
| **Command Palette** | Cmd+K / Ctrl+K instant navigation (cmdk) |
| **Dark / Light Mode** | Full dual-theme with next-themes, violet/indigo accent |
| **Mock Auth** | Demo login — any credentials work; state persists via Zustand |
| **Demo Reset** | Settings page → "Reset Demo Data" restores all seed content |

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript strict)
- **Tailwind CSS** + **shadcn/ui** + **@base-ui/react** — customized violet/indigo theme
- **Framer Motion** — page transitions, micro-interactions, AnimatePresence
- **@hello-pangea/dnd** — Kanban drag-and-drop
- **Zustand** + `persist` middleware — client-side state, localStorage
- **idb-keyval** — IndexedDB for image blobs (Guidebook)
- **Recharts** — Dashboard donut chart
- **date-fns** — Date manipulation (PT-BR locale)
- **cmdk** — Command palette
- **sonner** — Toast notifications
- **next-themes** — Light/dark theme toggle
- **lucide-react** — Icons

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/creatorflow.git
cd creatorflow

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

Click **"Acessar a Demo"** and enter any email + password to log in.

---

## Project Structure

```
src/
  app/
    page.tsx                      # Public landing / showcase page
    (auth)/login/page.tsx         # Mock login
    (app)/dashboard/page.tsx      # KPIs + charts
    (app)/campaigns/page.tsx      # Campaign grid
    (app)/campaigns/[id]/page.tsx # Kanban board
    (app)/calendar/page.tsx       # Editorial calendar
    (app)/settings/page.tsx       # Theme + demo reset
  components/
    ui/                           # shadcn/base-ui components
    kanban/                       # KanbanBoard, Column, Card, Dialogs
    layout/                       # Sidebar, Topbar, ThemeToggle, CommandPalette
  lib/
    store/useCreatorStore.ts      # Zustand store (campaigns, cards, user)
    db/index.ts                   # IndexedDB wrapper (idb-keyval)
    seed/index.ts                 # Realistic demo data (3 campaigns, 12 cards)
    types.ts                      # TypeScript types + label maps
```

---

## Data Model

```typescript
type ContentType = "video" | "presentation" | "game";
type Stage       = "script" | "narration" | "art" | "editing" | "review" | "published";
type Priority    = "low" | "medium" | "high";
type ApprovalStatus = "pending" | "approved" | "rejected";

interface Campaign { id, name, description, color, icon, createdAt, dueDate?, archived }
interface Card     { id, campaignId, title, description, contentType, stage, priority,
                     approvalStatus, dueDate, checklist, guidebook, createdAt, updatedAt }
interface GuidebookBlock { id, type: "text" | "image", content, order, createdAt }
```

All data lives in `localStorage` (via Zustand persist). Images are stored as base64 in IndexedDB.

---

## Demo Seed Data

Three realistic campaigns ship by default:

1. **"Relançamento do Canal no YouTube"** — 5 video cards at various stages (includes overdue items for dashboard demo)
2. **"Série de Pitch Decks para Clientes"** — 4 presentation cards
3. **"Devlog do Jogo Indie"** — 3 game cards

To reset to the original data: **Settings → Resetar Dados da Demo**.

---

## Deploy to Vercel

No environment variables required. Connect the GitHub repo to Vercel and deploy:

```bash
# Or via CLI
npx vercel --prod
```

The project is 100% static-compatible — no server functions, no database.

---

## License

MIT — use it as reference for your own portfolio.
