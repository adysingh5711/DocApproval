"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">

      {/* ── Brand panel: full-width on mobile, half on desktop ── */}
      <div className="relative flex flex-col justify-between w-full lg:w-1/2 bg-indigo-600 px-8 py-10 lg:px-14 lg:py-12 text-white overflow-hidden">

        {/* Decorative rings */}
        <div className="absolute -top-20 -left-20 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 lg:w-[28rem] lg:h-[28rem] rounded-full bg-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg select-none">
            D
          </div>
          <span className="text-xl font-semibold tracking-tight">DocApproval</span>
        </div>

        {/* Hero copy — condensed on mobile */}
        <div className="z-10 mt-10 lg:mt-0 space-y-5 pb-2 lg:pb-0">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
            Approvals that<br className="hidden sm:block" /> move at your pace.
          </h1>
          <p className="text-indigo-200 text-sm lg:text-base leading-relaxed max-w-sm">
            Route documents, collect sign-offs, and analyse every decision
            in one auditable workspace.
          </p>

          {/* Feature pills — real routes only */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["Dashboard", "Analyse", "Automate"].map((label) => (
              <span
                key={label}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-indigo-100 border border-white/20"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom note: hidden on mobile to save vertical space */}
        <p className="hidden lg:block z-10 text-xs text-indigo-300">
          Sign in to access your workspace.
        </p>
      </div>

      {/* ── Sign-in panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-sm space-y-8">

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500">
              Sign in to continue to your DocApproval account.
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-50 px-3 text-slate-400 uppercase tracking-widest">
                Continue with
              </span>
            </div>
          </div>

          {/* Google button */}
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 border-slate-200 bg-white text-slate-700 font-medium
                       hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-700
                       active:scale-[0.98] transition-all duration-150 shadow-sm flex items-center gap-3"
            onClick={handleLogin}
          >
            {/* Google G — inline SVG, no external dep */}
            <svg
              width="18" height="18" viewBox="0 0 48 48"
              aria-hidden="true" focusable="false"
            >
              <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.2-18.1 10.3z" />
              <path fill="#FBBC05" d="M24 44c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.4 35.7 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.2C9.9 37.9 16.4 44 24 44z" />
              <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.2C41.1 36.1 44 31.1 44 24c0-1.2-.1-2.3-.4-3.5z" />
            </svg>
            Sign in with Google
          </Button>

          {/* Legal */}
          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By signing in, you agree to the{" "}
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
  );
}
