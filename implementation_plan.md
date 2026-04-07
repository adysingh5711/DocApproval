# DocApproval Frontend Implementation Plan

This document outlines the plan to build the DocApproval frontend using Next.js 14, Tailwind CSS, Shadcn/UI, and Framer Motion. 

## Proposed Changes

We will scaffold the application and build all necessary mocked UI components to provide the required "SaaS-premium" feel, adhering to the specifications provided in `docapproval-portal-spec.md` and `frontend.md`.

### [1. Project Setup & Configuration]
#### [NEW] Next.js Initialization
Initialize the Next.js project. We will use standard `npm create next-app@latest` with App router.
Command: `npx --yes create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm`

If the directory isn't empty, I will create it in a temp directory and move the files, or I will use `npm create` with `--force`.

#### [NEW] Dependencies
Install the required frontend dependencies:
- Animation & Icons: `framer-motion`, `lucide-react`
- Data filtering: `fuse.js`
- UI utils: `clsx`, `tailwind-merge`

#### [NEW] Shadcn/UI Setup
Initialize Shadcn UI and add the required components:
`button`, `card`, `input`, `badge`, `table`, `dialog` (for modals), `dropdown-menu`, `sheet` (for Tracking Panel), `select` (for category/subcategory), `label`.

#### [MODIFY] `src/app/globals.css`
Inject custom theme variables for status badges and background mesh gradients as defined in `frontend.md`.

---

### [2. Core Layout & Routing]

#### [NEW] `src/components/layout/AppLayout.tsx`
Implement the persistent sidebar navigation (with mesh gradient background) spanning logic for Desktop/Tablet/Mobile.

#### [NEW] App Routes Structure
- `src/app/login/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/analyse/page.tsx`
- `src/app/analyse/[docId]/page.tsx`
- `src/app/settings/categories/page.tsx`

*Note: For the inner pages, we will wrap them in the `AppLayout` component. `login` will be standalone.*

---

### [3. UI Components Implementation]

#### [NEW] `src/components/dashboard/DocCard.tsx`
- Implement Framer Motion grid items as spec'd.
- Include badge component and hover dynamics.

#### [NEW] `src/components/analyse/ReviewersTable.tsx`
- Table of reviewers and statuses with staggered entrance animations.
- "Remind" button tied to response status.

#### [NEW] `src/components/analyse/EmailModal.tsx`
- Shadcn dialog for customizing the reminder email, applying syntax highlighting.

#### [NEW] `src/components/analyse/TrackingConfigPanel.tsx`
- Shadcn Sheet (slide-over) for interval settings and auto-stop toggle.

----

## User Review Required

> [!NOTE]
> Since this focuses *only on the frontend* for now, we will use **mock data** to populate the Dashboard list and Analysis pages so that the layout works out of the box and can be visually verified.

> [!IMPORTANT]
> The specification explicitly mentions **Tailwind CSS v4**, which Next.js 15+ supports robustly but requires `--tailwind` config changes. When setting up Shadcn, it currently expects standard Tailwind v3 structures (`tailwind.config.ts`).
> I will install standard Tailwind (likely v3.4 or the latest standard bundled by Next.js if it doesn't cause Shadcn issues). Is this fine? 

## Verification Plan

### Automated Tests
Run standard Next linting and build checks:
- `npm run lint`

### Manual Verification
Start the development server (`npm run dev`) and manually inspect:
1. The `/login` visual layout.
2. The `/dashboard` card grid, animations, and Fuse search functionality against mock items.
3. The `/analyse` form structure and URL extraction mock.
4. The `/analyse/[docId]` responsive staggered table and Tracking panel drawer.
