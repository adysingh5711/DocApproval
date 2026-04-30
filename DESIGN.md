---
version: "alpha"
name: DocApproval
description: >
  Design system for DocApproval Portal — a professional document approval
  workflow manager integrating Google Drive, Gmail, and real-time Convex backend.

colors:
  primary: "#212121"
  primary-foreground: "#F7F7F7"
  secondary: "#F5F5F5"
  secondary-foreground: "#2E2E2E"
  background: "#FFFFFF"
  foreground: "#212121"
  muted: "#F5F5F5"
  muted-foreground: "#7A7A7A"
  border: "#E8E8E8"
  ring: "#A8A8A8"
  destructive: "#DC2626"
  on-destructive: "#FFFFFF"
  success: "#059669"
  on-success: "#FFFFFF"
  warning: "#D97706"
  on-warning: "#FFFFFF"
  sidebar: "#F7F7F7"
  sidebar-foreground: "#212121"
  sidebar-primary: "#2E2E2E"
  sidebar-primary-foreground: "#F7F7F7"

typography:
  h1:
    fontFamily: Geist Sans
    fontSize: 2.25rem
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Geist Sans
    fontSize: 1.5rem
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  h3:
    fontFamily: Geist Sans
    fontSize: 1.125rem
    fontWeight: "600"
    lineHeight: "1.4"
  body-md:
    fontFamily: Geist Sans
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: Geist Sans
    fontSize: 0.75rem
    fontWeight: "400"
    lineHeight: "1.5"
  label:
    fontFamily: Geist Sans
    fontSize: 0.75rem
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: "0.01em"
  code:
    fontFamily: Geist Mono
    fontSize: 0.8125rem
    fontWeight: "400"
    lineHeight: "1.6"

rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "#3A3A3A"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-destructive}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-approved:
    backgroundColor: "#ECFDF5"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-pending:
    backgroundColor: "#FFFBEB"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-declined:
    backgroundColor: "#FFF1F2"
    textColor: "{colors.destructive}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.sidebar-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  sidebar-item-active:
    backgroundColor: "{colors.sidebar-primary}"
    textColor: "{colors.sidebar-primary-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
---

## Overview

DocApproval follows a **Functional Minimalism** aesthetic — precision tooling for knowledge workers, not a marketing site. The UI should feel closer to Linear or Vercel than to a consumer SaaS: clean white surfaces, near-black typography, and zero decorative chrome. Every pixel earns its place by communicating state: approved, pending, declined, or tracking.

The entire palette is achromatic except for three semantic status colors (green, amber, red). This deliberate constraint means color only ever carries _meaning_, never decoration. An agent generating new UI in this system must never introduce a fourth hue without a corresponding approval-workflow semantic.

## Colors

The palette is built on high-contrast neutrals from shadcn/ui's `base-nova` theme, rendered in oklch internally but mapped to sRGB hex for interoperability.

- **Primary (#212121):** Near-black foreground for all headings, labels, and primary interactive elements.
- **Background (#FFFFFF):** Pure white page and card surfaces.
- **Muted (#F5F5F5) / Muted Foreground (#7A7A7A):** Quiet backgrounds for secondary sections and helper text. Never use these for primary content.
- **Border (#E8E8E8):** All dividers, input outlines, and card borders. Consistent across light mode.
- **Destructive (#DC2626):** Used exclusively for error states, delete actions, and DECLINED approval status.
- **Success (#059669) / Warning (#D97706):** Status-only colors for APPROVED and PENDING states respectively. Must not be repurposed for non-status UI.

The dark mode shifts the background to `#1F1F1F` and foreground to `#F7F7F7`. The sidebar gains a single chromatic accent — `#3B82F6` (blue-500) — for the active navigation item only.

## Typography

Both typefaces are from the Vercel Geist family, loaded via `next/font` for zero-layout-shift rendering.

- **Geist Sans** covers all UI text: headings, body, labels, and navigation.
- **Geist Mono** is reserved for code snippets, document IDs, API keys, and any fixed-width tabular data (e.g., reviewer email addresses in the tracking table).
- Heading sizes scale on a `1.25` modular ratio from the `0.875rem` base. Do not introduce custom font sizes outside the defined scale.
- Letter spacing tightens on larger headings (`-0.02em` for h1, `-0.015em` for h2) to counteract optical looseness at display sizes.

## Layout

The app uses a sidebar + main content shell, consistent with the Next.js App Router route group `(app)`.

- **Sidebar width:** `240px` fixed on desktop; collapses to an icon rail at `< 768px`.
- **Content max-width:** `1200px` centered with `auto` horizontal margins.
- **Page padding:** `{spacing.xl}` (32px) on desktop, `{spacing.md}` (16px) on mobile.
- **Card grid:** 12-column CSS grid. Document cards span 4 columns at `>= 1024px`, 6 at `>= 768px`, 12 below.
- **Section gap:** `{spacing.lg}` (24px) between distinct content blocks within a page.
- All interactive rows (document list items, reviewer rows) have a minimum hit target height of `44px` per WCAG 2.5.8.

## Elevation & Depth

DocApproval uses elevation sparingly. The UI is predominantly flat — depth is communicated through border and background contrast, not shadows.

- **Level 0 (base):** `background` color, no shadow. Used for page body.
- **Level 1 (card):** `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`. Used for document cards and panels.
- **Level 2 (dropdown/popover):** `box-shadow: 0 4px 12px rgba(0,0,0,0.12)`. Used for command palettes, dropdowns, and modals.
- **Level 3 (toast/overlay):** `box-shadow: 0 8px 24px rgba(0,0,0,0.16)`. Used for toast notifications and full-screen dialogs only.

Never stack two Level 2+ surfaces on top of each other. A modal must always be the topmost elevated surface in the hierarchy.

## Shapes

Border radius follows the `--radius: 0.625rem` (10px) base token defined in `globals.css`, with a calculated scale.

- `rounded.sm` (6px): Icon buttons, badges, inline chips.
- `rounded.md` (8px): Standard buttons, inputs, select dropdowns.
- `rounded.lg` (10px): Cards, panels, sidebar items.
- `rounded.xl` (14px): Modals, large dialogs, full-feature cards.
- `rounded.full` (9999px): Status badges, avatar thumbnails, toggle switches.

Avoid mixing radius sizes on components that share a visual grouping (e.g., a card's inner button should not have a larger radius than the card itself).

## Components

### Approval Status Badges

Three badge variants map 1:1 to the Google Drive Approvals API `status` field:

| API Status | Badge Variant | Background | Text |
|---|---|---|---|
| `APPROVED` | `badge-approved` | `#ECFDF5` | `#059669` |
| `PENDING` / `NO_RESPONSE` | `badge-pending` | `#FFFBEB` | `#D97706` |
| `DECLINED` / `CANCELLED` | `badge-declined` | `#FFF1F2` | `#DC2626` |

The text inside a badge always uses `typography.label`. Badge widths are content-driven; never stretch them to fill a container.

### Buttons

- Use `button-primary` for the single dominant action per view (e.g., "Analyse Document", "Start Tracking").
- Use `button-secondary` for non-destructive secondary actions (e.g., "Cancel", "Edit Category").
- Use `button-destructive` only for irreversible operations: stopping a tracking job or deleting a document from the portal.
- Ghost/outline button variants inherit `border: 1px solid {colors.border}` with `background: transparent`. They share the same rounded and padding tokens as `button-secondary`.

### Sidebar Navigation

Navigation items use `sidebar-item` at rest. The active route uses `sidebar-item-active` with `{colors.sidebar-primary}` background. In dark mode, the active item switches to `#3B82F6` background to provide the only chromatic accent in the interface.

### Tracking Job Controls

The start/stop control for a tracking job is a toggle button pair, not a standard checkbox. The active (tracking) state uses `button-primary` styling; the inactive state uses `button-secondary`. The interval selector (hours/days/weeks) is a segmented control using `rounded.md` buttons sharing a common border.

### Email Reminder Composer

The reminder subject and body fields are standard `input` components. Template variables (`{Document Title}`, `{Document Link}`) must render as inline `badge-pending` chips within the textarea preview, not raw strings. The send button uses `button-primary`.

## Do's and Don'ts

**Do:**
- Use semantic status colors (`success`, `warning`, `destructive`) exclusively for approval state communication.
- Use `Geist Mono` for all email addresses, file IDs, API tokens, and timestamps displayed in data tables.
- Maintain `44px` minimum touch targets on all interactive elements.
- Use `{spacing.md}` (16px) as the minimum internal padding for any card or panel.
- Preserve the sidebar's fixed width; it communicates structural stability in a workflow tool.
- Show skeleton loaders (not spinners) for async data that takes > 300ms to resolve — Convex real-time queries rarely need them, but Drive API calls do.

**Don't:**
- Do not introduce new hue-bearing colors for decorative purposes. The achromatic palette is a deliberate product decision.
- Do not use shadow `Level 2+` on elements that are not overlaid (positioned above other content in the stacking context).
- Do not wrap status badges in additional colored containers — the badge itself is the full semantic unit.
- Do not truncate reviewer email addresses in the approval table; use horizontal scroll instead.
- Do not use `font-weight: 400` on text smaller than `0.75rem` — it becomes illegible at sub-label scale.
- Do not render raw JSON from `latestApprovalSnapshot` directly in the UI; always map to the defined badge/status components.
