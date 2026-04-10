"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play, Square, AlertCircle, Clock, Zap } from "lucide-react";

const UNITS = ["hours", "days", "weeks"] as const;
type Unit = typeof UNITS[number];

interface TrackingPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTrackingActive: boolean;
  documentId: string;
  initialIntervalValue?: number;
  initialIntervalUnit?: Unit;
  initialAutoStop?: boolean;
}

export function TrackingConfigPanel({
  open,
  onOpenChange,
  isTrackingActive,
  documentId,
  initialIntervalValue = 6,
  initialIntervalUnit = "hours",
  initialAutoStop = true,
}: TrackingPanelProps) {
  const [intervalValue, setIntervalValue] = useState(initialIntervalValue);
  const [intervalUnit, setIntervalUnit] = useState<Unit>(initialIntervalUnit);
  const [autoStop, setAutoStop] = useState(initialAutoStop);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setIntervalValue(initialIntervalValue);
      setIntervalUnit(initialIntervalUnit);
      setAutoStop(initialAutoStop);
      setError("");
    }
  }, [open, initialIntervalValue, initialIntervalUnit, initialAutoStop]);

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tracking/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, intervalValue, intervalUnit, autoStop }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start tracking");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tracking/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to stop tracking");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:w-[440px] p-0 flex flex-col gap-0 border-l border-slate-100">

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-indigo-600" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold text-slate-900 leading-tight">
                Tracking configuration
              </SheetTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated reminders for pending reviewers.
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Interval */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Reminder interval
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {/* Number stepper */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Every</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIntervalValue((v) => Math.max(1, v - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-sm font-medium flex items-center justify-center"
                  >
                    −
                  </button>
                  <Input
                    type="number"
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-14 h-7 text-center text-sm border-slate-200 focus-visible:ring-indigo-500/30 px-1"
                  />
                  <button
                    type="button"
                    onClick={() => setIntervalValue((v) => v + 1)}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-sm font-medium flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Unit toggle */}
              <div className="flex divide-x divide-slate-100">
                {UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setIntervalUnit(unit)}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${intervalUnit === unit
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    {unit}
                    {intervalUnit === unit && (
                      <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-indigo-500 align-middle" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview pill */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={11} className="text-slate-400" />
              Reminders will fire every{" "}
              <span className="font-semibold text-slate-700">
                {intervalValue} {intervalUnit}
              </span>
            </div>
          </div>

          {/* Auto-stop toggle */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Behaviour
            </p>

            <div className="bg-white border border-slate-200 rounded-xl px-4 py-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-indigo-500" />
                  <span className="text-sm font-medium text-slate-900">Auto-stop on terminal status</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Stop tracking automatically when the document is APPROVED or DECLINED.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoStop}
                onClick={() => setAutoStop(!autoStop)}
                className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${autoStop ? "bg-indigo-600" : "bg-slate-200"
                  }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${autoStop ? "translate-x-4" : "translate-x-0.5"
                    }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {autoStop && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-2.5 rounded-xl"
                >
                  <Zap size={12} className="mt-0.5 shrink-0" />
                  Tracking halts once consensus is reached - no unnecessary pings.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl"
              >
                <AlertCircle size={13} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-5 border-t border-slate-100 shrink-0">
          {isTrackingActive ? (
            <Button
              onClick={handleStop}
              disabled={loading}
              className="w-full h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 gap-2 text-sm font-medium shadow-none"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Stopping...</>
              ) : (
                <><Square size={13} fill="currentColor" /> Stop tracking</>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Starting...</>
              ) : (
                <><Play size={13} fill="currentColor" /> Save &amp; start tracking</>
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
