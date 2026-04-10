"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className={`p-6 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-4 ${this.props.className ?? ""}`}
        >
          {/* Icon + text */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertCircle size={16} className="text-rose-600" />
            </div>
            <div className="pt-0.5 space-y-0.5">
              <p className="text-sm font-semibold text-rose-900">Something went wrong</p>
              <p className="text-xs text-rose-500 leading-relaxed">
                An error occurred while rendering this component.
              </p>
            </div>
          </div>

          {/* Retry */}
          <button
            onClick={() => this.setState({ hasError: false })}
            className="self-start flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCcw size={12} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
