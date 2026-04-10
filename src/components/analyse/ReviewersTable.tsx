"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoogleProfileHover, ReviewerAvatar } from "@/components/shared/GoogleProfileHover";
import { Bell } from "lucide-react";

interface Reviewer {
  name: string;
  email: string;
  response: "APPROVED" | "PENDING" | "DECLINED" | "NO_RESPONSE";
  actionTime?: string;
  profile?: any;
}

const statusConfig = {
  APPROVED: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
  PENDING: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" },
  DECLINED: { dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 border-rose-200", label: "Declined" },
  NO_RESPONSE: { dot: "bg-slate-300", badge: "bg-slate-50 text-slate-500 border-slate-200", label: "No response" },
};

const formatActionTime = (iso: string | null | undefined) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function ReviewersTable({
  reviewers,
  onRemind,
}: {
  reviewers: Reviewer[];
  onRemind: (email: string) => void;
}) {
  if (reviewers.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        No reviewers found for this document.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[1fr_120px_140px_80px] gap-4 px-4 pb-1">
        {["Reviewer", "Status", "Actioned at", ""].map((h) => (
          <p key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      {reviewers.map((r, i) => {
        const sc = statusConfig[r.response] ?? statusConfig.NO_RESPONSE;
        const time = formatActionTime(r.actionTime);
        const canRemind = r.response === "NO_RESPONSE";

        return (
          <motion.div
            key={r.email}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-100 rounded-xl px-4 py-3 grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_80px] gap-3 sm:gap-4 items-center hover:border-slate-200 transition-colors"
          >
            {/* Reviewer */}
            <GoogleProfileHover email={r.email} name={r.name} initialProfile={r.profile}>
              <div className="flex items-center gap-3 cursor-pointer group/hover w-fit">
                <ReviewerAvatar
                  email={r.email}
                  name={r.name}
                  className="h-8 w-8 border border-slate-100 shrink-0 transition-transform group-hover/hover:scale-105"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight group-hover/hover:text-indigo-600 transition-colors">
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-400 group-hover/hover:text-indigo-400 transition-colors">
                    {r.email}
                  </p>
                </div>
              </div>
            </GoogleProfileHover>

            {/* Status pill */}
            <div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>

            {/* Time */}
            <p className="text-xs text-slate-500">
              {time ?? <span className="text-slate-300">—</span>}
            </p>

            {/* Remind button */}
            <div className="flex justify-start sm:justify-end">
              <Button
                disabled={!canRemind}
                variant="ghost"
                size="sm"
                onClick={() => onRemind(r.email)}
                className="h-8 px-3 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed gap-1.5 transition-all"
              >
                <Bell size={12} />
                Remind
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
