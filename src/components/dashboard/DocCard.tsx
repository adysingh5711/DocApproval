import { motion } from "framer-motion";
import Link from "next/link";
import { Trash2, Loader2, ArrowRight, Radio } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";

export interface Doc {
  id: string;
  title: string;
  status: "APPROVED" | "PENDING" | "DECLINED" | "CANCELLED";
  category: string;
  subcategory: string;
  isTracking: boolean;
  lastAnalysedAt: string;
  _id?: string;
}

const STATUS_CONFIG = {
  APPROVED: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  PENDING: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  DECLINED: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
  CANCELLED: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-100" },
} as const;

export function DocCard({ doc }: { doc: Doc }) {
  const removeDoc = useMutation(api.documents.remove);
  const [isDeleting, setIsDeleting] = useState(false);
  const s = STATUS_CONFIG[doc.status];

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!doc._id) return;
    if (!confirm(`Delete "${doc.title}"?`)) return;
    setIsDeleting(true);
    try {
      await removeDoc({ documentId: doc._id as Id<"documents"> });
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col h-full"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        {/* Status pill */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.bg} ${s.text} ${s.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {doc.status}
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-1.5">
          {doc.isTracking && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              <Radio size={9} className="animate-pulse" />
              LIVE
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
          >
            {isDeleting
              ? <Loader2 size={13} className="animate-spin text-slate-400" />
              : <Trash2 size={13} />
            }
          </button>
        </div>
      </div>

      {/* Title + taxonomy */}
      <div className="flex-1 space-y-1.5">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {doc.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
            {doc.category}
          </span>
          {doc.subcategory && (
            <>
              <span className="text-slate-300 text-[10px]">/</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                {doc.subcategory}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
          {doc.lastAnalysedAt}
        </span>
        <Link href={`/analyse/${doc.id}`}>
          <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 group-hover:gap-1.5 transition-all">
            View
            <ArrowRight size={12} />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
