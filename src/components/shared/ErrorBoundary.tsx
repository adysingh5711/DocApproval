"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className={`p-6 bg-rose-50 border border-rose-100 rounded-xl flex flex-col items-center justify-center text-center space-y-4 ${this.props.className}`}>
          <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-rose-900">Something went wrong</h3>
            <p className="text-sm text-rose-600/80 max-w-[250px]">
              We encountered an error while rendering this component.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => this.setState({ hasError: false })}
            className="border-rose-200 text-rose-700 hover:bg-rose-100"
          >
            <RefreshCcw size={14} className="mr-2" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
