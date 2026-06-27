# Campaigns Page — Design Overrides

> Inherits from `design-system/MASTER.md`. Only deviations are listed here.

## Layout
- Campaign grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Archived section: collapsible, separated visually (opacity-60 on archived cards)

## Unique Components

### Campaign Card
- Header band: `h-1.5 w-full` colored with campaign's `.color`
- Icon square: `w-10 h-10 rounded-xl bg-gradient-to-br` using campaign color tints
- Three-dot menu (`MoreHorizontal`) via `DropdownMenu` — appears on hover

### Campaign Icon Picker
- 10 icon options in a grid (Lucide icons)
- Selected state: `ring-2 ring-violet-500 bg-violet-500/20`

### Campaign Color Picker  
- 8 swatches (`w-7 h-7 rounded-full`)
- Selected state: `ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110`

### Archive Confirmation
- Destructive action uses `AlertTriangle` icon + red-tinted confirmation button
- Separate from primary actions visually

## New Campaign Modal
Same modal pattern as Quick Demand Dialog (MASTER animation tokens).  
Fields: Name · Description · Icon (picker grid) · Color (swatch picker).
