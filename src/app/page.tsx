import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DocApproval - Document Approval Workflows for Teams",
  description:
    "Route documents, collect sign-offs, and audit every decision in one workspace. Built for operations, legal, finance, and HR teams.",
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Multi-stage routing",
    description: "Define approval chains with multiple reviewers, sequential or parallel, per document type.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-time tracking",
    description: "See exactly where every document stands - pending, approved, or rejected, at a glance.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Full audit trail",
    description: "Every sign-off, comment, and status change is logged with timestamps and user attribution.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Analytics dashboard",
    description: "Track approval velocity, bottlenecks, and team performance across all document workflows.",
  },
];

export default function LandingPage() {
  return (
    <main className="h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 custom-scrollbar overflow-y-auto">
      {/* ── Nav ── */}
      <nav className="w-full px-6 lg:px-14 py-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base select-none">
            D
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900">DocApproval</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150"
        >
          Sign in
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-indigo-600 px-6 lg:px-14 py-20 lg:py-28 text-white">
        {/* Decorative rings */}
        <div className="absolute -top-20 -left-20 w-72 h-72 lg:w-[28rem] lg:h-[28rem] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 lg:w-[32rem] lg:h-[32rem] rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Now live - free to get started
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Approvals that move<br className="hidden sm:block" /> at your pace.
          </h1>
          <p className="text-indigo-200 text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
            Route documents, collect sign-offs, and analyse every decision
            in one auditable workspace. Built for teams that can&apos;t afford
            lost approvals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 lg:px-14 py-20 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Comprehensive workflow management
          </h2>
          <p className="text-slate-500 text-sm lg:text-base max-w-lg mx-auto">
            From automated routing to real-time analytics, we provide the tools to keep your business moving.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 lg:px-14 py-16 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Ready to streamline your approvals?
          </h2>
          <p className="text-slate-400 text-sm lg:text-base">
            Sign in with your Google account and set up your first workflow in minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150"
          >
            Sign in with Google
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 lg:px-14 py-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="sm:flex-1 flex items-center gap-2">
          <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs select-none">
            D
          </div>
          <span>DocApproval</span>
        </div>
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</a>
        </div>
        <div className="sm:flex-1 flex justify-center sm:justify-end">
          <p>© {new Date().getFullYear()} DocApproval. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
