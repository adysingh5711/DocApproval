"use client";
import Image from 'next/image';

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
          <img src="/images/DocApproval-logo/DocApproval-full-white.svg" alt="DocApproval Logo" className="h-9" />
        </div>

        {/* Hero copy - condensed on mobile */}
        <div className="z-10 mt-10 lg:mt-0 space-y-5 pb-2 lg:pb-0">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
            Approvals that<br className="hidden sm:block" /> move at your pace.
          </h1>
          <p className="text-indigo-200 text-sm lg:text-base leading-relaxed max-w-sm">
            Route documents, collect sign-offs, and analyse every decision
            in one auditable workspace.
          </p>

          {/* Feature pills - real routes only */}
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
            <Image
              src="/images/google-icon-logo.svg"
              alt="Google logo"
              width={18}
              height={18}
              aria-hidden="true"
              tabIndex={-1} // alternative for  focusable="false"
            />            Sign in with Google
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
