"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Reviewer {
  name: string;
  email: string;
  response: "APPROVED" | "PENDING" | "DECLINED" | "NO_RESPONSE";
}

const statusColorMap = {
  APPROVED: "success",
  PENDING: "warning",
  DECLINED: "danger",
  NO_RESPONSE: "secondary",
} as const;

export function ReviewersTable({ reviewers, onRemind }: { reviewers: Reviewer[], onRemind: (email: string) => void }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead>Reviewer</TableHead>
            <TableHead>Status</TableHead>
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
                <div className="font-medium text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant={statusColorMap[r.response] as any} className="font-semibold text-[10px] py-0.5 px-2">
                  {r.response === "NO_RESPONSE" ? "PENDING" : r.response}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  disabled={r.response !== "NO_RESPONSE"}
                  variant="outline" 
                  size="sm"
                  onClick={() => onRemind(r.email)}
                  className="rounded-full hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remind
                </Button>
              </TableCell>
            </motion.tr>
          ))}
          {reviewers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                No reviewers found for this document.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
