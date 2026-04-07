"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoogleProfileHover, ReviewerAvatar } from "@/components/shared/GoogleProfileHover";

interface Reviewer {
  name: string;
  email: string;
  response: "APPROVED" | "PENDING" | "DECLINED" | "NO_RESPONSE";
  actionTime?: string;
}

const statusColorMap = {
  APPROVED: "success",
  PENDING: "warning",
  DECLINED: "danger",
  NO_RESPONSE: "secondary",
} as const;

const formatActionTime = (iso: string | null | undefined) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function ReviewersTable({ reviewers, onRemind }: { reviewers: Reviewer[], onRemind: (email: string) => void }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="w-[40%]">Reviewer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action Time</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviewers.map((r, i) => (
            <motion.tr
              key={r.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group border-b last:border-0 hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="py-4">
                <GoogleProfileHover email={r.email} name={r.name}>
                  <div className="flex items-start gap-2 cursor-pointer group/hover w-fit">
                    <ReviewerAvatar
                      email={r.email}
                      name={r.name}
                      className="h-8 w-8 border border-slate-200 transition-transform group-hover/hover:scale-105"
                    />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 leading-tight group-hover/hover:text-indigo-600 transition-colors">
                        {r.name}
                      </div>
                      <div className="text-xs text-slate-500 group-hover/hover:text-indigo-400 transition-colors">
                        {r.email}
                      </div>
                    </div>
                  </div>
                </GoogleProfileHover>
              </TableCell>
              <TableCell>
                <Badge variant={statusColorMap[r.response] as any} className="font-bold text-[10px] py-0.5 px-2">
                  {r.response === "NO_RESPONSE" ? "PENDING" : r.response}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-slate-500">
                  {formatActionTime(r.actionTime)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  disabled={r.response !== "NO_RESPONSE"}
                  variant="outline"
                  size="sm"
                  onClick={() => onRemind(r.email)}
                  className="rounded-full hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed h-8 text-xs font-semibold px-4"
                >
                  Remind
                </Button>
              </TableCell>
            </motion.tr>
          ))}
          {reviewers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                No reviewers found for this document.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
