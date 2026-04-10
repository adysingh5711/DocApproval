import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DocApproval - Document Approval Workflows for Teams",
  description:
    "Route documents, collect sign-offs, and audit every decision in one workspace. Built for operations, legal, finance, and HR teams.",
  alternates: { canonical: "/" },
};

const beforeAfter = [
  {
    before: "\"Did you approve this?\" over Slack at 11pm",
    after: "Approval request delivered, tracked, timestamped",
  },
  {
    before: "Email thread with 12 forwards and no answer",
    after: "One link, one action - approve or reject with a note",
  },
  {
    before: "Audit asks for sign-off records. You panic.",
    after: "Full trail: who, when, what version, what they said",
  },
  {
    before: "CFO approved v3. Legal signed v5. Nobody noticed.",
    after: "Version-locked approvals - everyone signs the same doc",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 custom-scrollbar overflow-y-auto">

      {/* ── Nav ── */}
      <nav className="w-full px-6 lg:px-14 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30">
        <img
          src="/images/DocApproval-logo/DocApproval-full-violet.svg"
          alt="DocApproval Logo"
          className="h-8"
        />
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150"
        >
          Sign in
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 lg:px-14 pt-16 pb-0 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-end">
        <div className="space-y-7 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Free to start, no card required
          </div>

          <h1 className="text-4xl lg:text-[3.25rem] font-bold text-slate-900 leading-[1.12] tracking-tight">
            Stop chasing<br />
            approvals<br />
            <span className="text-indigo-600">in Slack.</span>
          </h1>

          <p className="text-slate-500 text-base lg:text-lg leading-relaxed max-w-md">
            DocApproval routes documents to the right people, in the right order,
            and keeps a permanent record of every decision. No more lost sign-offs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150 text-center"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 text-center"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Right: Inline UI mockup */}
        <div className="relative pb-0 hidden lg:block">
          {/* Stacked card shadow effect */}
          <div className="absolute bottom-0 left-6 right-6 h-64 rounded-t-2xl bg-slate-100 border border-slate-200" />
          <div className="absolute bottom-0 left-3 right-3 h-72 rounded-t-2xl bg-slate-50 border border-slate-200" />

          {/* Main card */}
          <div className="relative bg-white rounded-t-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Q2_Vendor_Contract.pdf</p>
                  <p className="text-[10px] text-slate-400">Sent by Priya M. · 2 hours ago</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Awaiting you
              </span>
            </div>

            {/* Approval chain */}
            <div className="px-5 py-4 space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Approval chain</p>
              {[
                { name: "Priya M.", role: "Initiator", status: "sent", color: "bg-slate-300" },
                { name: "Legal Team", role: "Step 1", status: "approved", color: "bg-emerald-400" },
                { name: "You", role: "Step 2", status: "pending", color: "bg-amber-400" },
                { name: "CFO", role: "Final", status: "waiting", color: "bg-slate-200" },
              ].map((step) => (
                <div key={step.name} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${step.color}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs text-slate-700 font-medium">{step.name}</span>
                    <span className="text-[10px] text-slate-400">{step.role}</span>
                  </div>
                  {step.status === "approved" && (
                    <span className="text-[10px] text-emerald-600 font-medium">Approved</span>
                  )}
                  {step.status === "pending" && (
                    <span className="text-[10px] text-amber-600 font-medium">Your turn</span>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
                Approve
              </button>
              <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
                Request changes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section id="how-it-works" className="px-6 lg:px-14 py-24 max-w-5xl mx-auto">
        <div className="mb-14 space-y-3">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Why teams switch</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            The approval process is<br className="hidden sm:block" /> already broken. You know it.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
          {/* Before column */}
          <div className="bg-slate-50">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Without DocApproval</span>
            </div>
            <ul className="divide-y divide-slate-200">
              {beforeAfter.map((item) => (
                <li key={item.before} className="px-6 py-4 text-sm text-slate-500 leading-relaxed">
                  {item.before}
                </li>
              ))}
            </ul>
          </div>

          {/* After column */}
          <div className="bg-white">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">With DocApproval</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {beforeAfter.map((item) => (
                <li key={item.after} className="px-6 py-4 text-sm text-slate-800 font-medium leading-relaxed">
                  {item.after}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ── UPDATED COLORS ── */}
      <section className="px-6 lg:px-14 py-20 bg-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 space-y-2">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Workflow</p>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Three steps. No training needed.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Upload the document",
                body: "Drag in any PDF or file. Assign an approval chain - sequential, parallel, or hybrid.",
              },
              {
                step: "02",
                title: "Reviewers get notified",
                body: "Each person receives a link, reviews in-browser, and approves or sends it back with a note.",
              },
              {
                step: "03",
                title: "You get a signed record",
                body: "Final approval generates a timestamped audit log. Every version, every decision - frozen forever.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-white rounded-2xl border border-indigo-100 px-8 py-8 space-y-3 overflow-hidden"
              >
                {/* Large ghost step number as background texture */}
                <span className="absolute -top-3 -right-1 text-8xl font-bold text-indigo-100 select-none pointer-events-none leading-none">
                  {s.step}
                </span>
                <span className="relative text-sm font-bold text-indigo-600">{s.step}</span>
                <h3 className="relative text-base font-semibold text-slate-900">{s.title}</h3>
                <p className="relative text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 lg:px-14 py-24 max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Your next approval is waiting.<br />
          <span className="text-indigo-600">Make it the last one you chase.</span>
        </h2>
        <p className="text-slate-500 text-sm lg:text-base max-w-md mx-auto">
          Set up your first workflow in under 5 minutes. No onboarding call. No credit card.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-200"
        >
          Start free with Google
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 lg:px-14 py-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="sm:flex-1 flex items-center gap-2">
          <img src="/images/DocApproval-logo/DocApproval-full-violet.svg" alt="DocApproval Logo" className="h-6" />
        </div>
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
        </div>
        <div className="sm:flex-1 flex justify-center sm:justify-end">
          <p>© {new Date().getFullYear()} DocApproval. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
