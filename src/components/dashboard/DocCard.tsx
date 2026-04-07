import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Doc {
  id: string;
  title: string;
  status: "APPROVED" | "PENDING" | "DECLINED" | "CANCELLED";
  category: string;
  subcategory: string;
  isTracking: boolean;
  lastAnalysedAt: string;
}

export function DocCard({ doc }: { doc: Doc }) {
  const statusColorMap = {
    APPROVED: "success",
    PENDING: "warning",
    DECLINED: "danger",
    CANCELLED: "secondary",
  } as const;

  const badgeVariant = statusColorMap[doc.status] || "default";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <Badge variant={badgeVariant as any} className="font-semibold text-xs py-0.5 px-2.5">
          {doc.status}
        </Badge>
        {doc.isTracking && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <div className="h-1.5 w-1.5 bg-amber-600 rounded-full animate-pulse" />
            TRACKING
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {doc.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {doc.category} • {doc.subcategory}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
          Analyzed {doc.lastAnalysedAt}
        </span>
        <Link href={`/analyse/${doc.id}`}>
          <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold h-8 group-hover:bg-indigo-50">
            View →
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
