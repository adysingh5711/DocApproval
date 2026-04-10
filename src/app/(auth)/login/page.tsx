"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">

      {/* ── Left: Context panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-indigo-50 border-r border-indigo-100 px-14 py-12">

        {/* Logo */}
        <Link href="/">
          <img
            src="/images/DocApproval-logo/DocApproval-full-violet.svg"
            alt="DocApproval Logo"
            className="h-8"
          />
        </Link>

        {/* Centre: mini document trail card */}
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
              Your workspace
            </p>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              Every approval,<br />in one place.
            </h2>
          </div>

          {/* Inline document card - same language as landing hero mockup */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden max-w-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Q2_Vendor_Contract.pdf</p>
                  <p className="text-[10px] text-slate-400">Awaiting your approval</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Pending
              </span>
            </div>
            <div className="px-5 py-3 space-y-2">
              {[
                { name: "Legal Team", status: "approved", color: "bg-emerald-400" },
                { name: "You", status: "pending", color: "bg-amber-400" },
                { name: "CFO", status: "waiting", color: "bg-slate-200" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                  <span className="text-xs text-slate-600 flex-1">{s.name}</span>
                  {s.status === "approved" && <span className="text-[10px] text-emerald-600 font-medium">Approved</span>}
                  {s.status === "pending" && <span className="text-[10px] text-amber-600 font-medium">Your turn</span>}
                  {s.status === "waiting" && <span className="text-[10px] text-slate-400">Waiting</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Three micro-stats */}
          <div className="flex gap-6">
            {[
              { val: "2.4s", label: "Avg. response" },
              { val: "100%", label: "Audit coverage" },
              { val: "0", label: "Lost approvals" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-bold text-indigo-600">{stat.val}</p>
                <p className="text-[11px] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom legal */}
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} DocApproval. All rights reserved.
        </p>
      </div>

      {/* ── Right: Sign-in panel ── */}
      <div className="flex flex-1 flex-col bg-white">

        {/* Mobile-only logo */}
        <div className="flex lg:hidden px-6 pt-8 pb-4">
          <Link href="/">
            <img
              src="/images/DocApproval-logo/DocApproval-full-violet.svg"
              alt="DocApproval Logo"
              className="h-8"
            />
          </Link>
        </div>

        {/* Centred form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm space-y-8">

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sign in
              </h1>
              <p className="text-sm text-slate-500">
                Continue to your DocApproval workspace.
              </p>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-12 border-slate-200 bg-white text-slate-700 font-medium
                         hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700
                         active:scale-[0.98] transition-all duration-150 shadow-sm flex items-center gap-3"
              onClick={handleLogin}
            >
              <Image
                src="/images/google-icon-logo.svg"
                alt="Google logo"
                width={18}
                height={18}
                aria-hidden="true"
                tabIndex={-1}
              />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-widest">
                  Free to get started
                </span>
              </div>
            </div>

            {/* Three trust lines */}
            <ul className="space-y-2">
              {[
                "No credit card required",
                "Full audit trail from day one",
                "Set up your first workflow in 5 minutes",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2 text-sm text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {line}
                </li>
              ))}
            </ul>

            {/* Legal */}
            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By signing in you agree to the{" "}
              <a href="/terms" className="underline underline-offset-2 hover:text-indigo-600 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
