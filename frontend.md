This frontend architecture leverages **Next.js 14**, **Shadcn/UI**, **Tailwind CSS v4**, and **Framer Motion** to create a high-end, "SaaS-premium" feel. The focus is on clarity, accessibility, and smooth micro-interactions that make the data-heavy nature of document approvals feel lightweight.

---

## 1. Design System & Tokens
To align with the DocApproval spec, we use a clean "Inter" font stack with a professional color palette:
* **Primary:** Indigo-600 (Actionable)
* **Success:** Emerald-500 (Approved)
* **Warning:** Amber-500 (Pending/Tracking)
* **Surface:** Slate-50/100 (Backgrounds)

### Required Dependencies
```bash
npm install lucide-react framer-motion clsx tailwind-merge fuse.js
npx shadcn-ui@latest add card button input badge table dialog dropdown-menu
```

---

## 2. The Core Layout (Glassmorphism Sidebar)
We use a persistent sidebar for navigation. The background uses a subtle mesh gradient for depth.

```tsx
// components/layout/AppLayout.tsx
import { motion } from "framer-motion";
import { LayoutDashboard, Search, Settings, LogOut } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <aside className="w-64 border-r bg-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DocApproval</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" active />
          <NavItem icon={<Search size={20} />} label="Analyse" href="/analyse" />
          <NavItem icon={<Settings size={20} />} label="Categories" href="/settings/categories" />
        </nav>

        <div className="pt-4 border-t">
          <button className="flex items-center gap-3 text-slate-500 hover:text-rose-600 transition-colors px-3 py-2 w-full">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
```

---

## 3. Dashboard: Document Library (Motion Grid)
Using `AnimatePresence` and `layout` props to handle fuzzy filtering smoothly.

```tsx
// components/dashboard/DocCard.tsx
export function DocCard({ doc }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <Badge variant={doc.status === 'APPROVED' ? 'success' : 'warning'}>
          {doc.status}
        </Badge>
        {doc.isTracking && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
            <div className="h-1.5 w-1.5 bg-amber-600 rounded-full" />
            TRACKING
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {doc.title}
      </h3>
      <p className="text-xs text-slate-500 mt-1">{doc.category} • {doc.subcategory}</p>
      
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Analyzed 6 Apr</span>
        <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold">View →</Button>
      </div>
    </motion.div>
  );
}
```

---

## 4. Status Page: Approval Breakdown
This view mimics a professional audit tool. The **Reviewers Table** uses a staggered animation for row entry.

```tsx
// components/analyse/ReviewersTable.tsx
export function ReviewersTable({ reviewers }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Reviewer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviewers.map((r, i) => (
            <motion.tr
              key={r.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <TableCell className="py-4">
                <div className="font-medium text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.email}</div>
              </TableCell>
              <TableCell>
                <ResponseChip status={r.response} />
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  disabled={r.response !== "NO_RESPONSE"}
                  variant="outline" 
                  size="sm"
                  className="rounded-full hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Remind
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## 5. Interaction Details (The "Wow" Factor)

### A. The "Analyse" Button State
When clicking "Analyse", the button shouldn't just show a spinner; it should transform.
* **Idle:** `[ Analyse Document ]`
* **Loading:** `[ . . . ]` (Expanding dots)
* **Success:** Button slides up, and the new card "pops" into the list.

### B. Tracking Configuration Panel
Use a **Shadcn Sheet** (Slide-over) from the right.
* **Logic:** When "Auto-stop" is toggled, a small explanatory text should fade in using `Framer Motion`'s `AnimatePresence`.
* **Visual:** Use a `Slider` component for the Interval Value to make it feel more interactive than a raw text input.

### C. Email Modal substitutions
As the user types in the Email Customization Modal, use a "Highlight" effect (Indigo background) on `{Document Link}` and `{Document Title}` variables so they know these are dynamic and cannot be broken.

---

## 6. CSS Themes (Tailwind v4)
Configure your `globals.css` to handle the status colors consistently:

```css
@theme {
  --color-success-bg: #ecfdf5;
  --color-success-text: #059669;
  --color-warning-bg: #fffbeb;
  --color-warning-text: #d97706;
  --color-danger-bg: #fff1f2;
  --color-danger-text: #e11d48;
}

.badge-success { @apply bg-success-bg text-success-text border-success-text/20; }
.badge-warning { @apply bg-warning-bg text-warning-text border-warning-text/20; }
.badge-danger  { @apply bg-danger-bg text-danger-text border-danger-text/20; }
```

---

## 7. Responsive Strategy
* **Desktop:** 3-column grid for the Dashboard.
* **Tablet:** 2-column grid.
* **Mobile:** 1-column stack. The Sidebar collapses into a Bottom Navigation Bar with icons only (`Dashboard`, `Analyse`, `Categories`) to maintain the "App" feel.

**Why this works:** It respects the **Convex backend** speed by using client-side fuzzy search (Fuse.js) for instant results and uses Framer Motion to mask the small latency of API calls during "Re-analyse" or "Send Reminder" actions.