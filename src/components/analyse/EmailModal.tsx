"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, Send, AlertCircle, Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ── Default template (used as fallback if user has not saved custom templates) ─
export const DEFAULT_SUBJECT = `Action needed: Please review "{Document Title}"`;

export const DEFAULT_BODY = `Hi,

This is a friendly reminder that a document is awaiting your review and approval.

Document: {Document Title}
Link: {Document Link}

Please take a moment to review it and record your decision at your earliest convenience. If you have already responded, kindly disregard this message.

Thank you for your time.`;

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  docTitle?: string;
  docUrl?: string;
}

export function EmailModal({ open, onOpenChange, email, docTitle, docUrl }: EmailModalProps) {
  const { data: session } = useSession();
  const user = useQuery(
    api.users.getByEmail as any,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const rawSubject = user?.reminderSubject || DEFAULT_SUBJECT;
      const rawBody = user?.reminderBody || DEFAULT_BODY;
      const title = docTitle || "Untitled Document";
      const link = docUrl || "#";
      setSubject(rawSubject.replace(/{Document Title}/g, title));
      setBody(rawBody.replace(/{Document Link}/g, link).replace(/{Document Title}/g, title));
      setError("");
    }
  }, [open, docTitle, docUrl, user]);

  const handleSend = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl border-slate-100">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 leading-tight">
                Send reminder
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit before sending — changes are not saved to your template.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* To */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-widest">To</Label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">
                  {email.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-slate-600 font-medium truncate">{email}</span>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-slate-200 focus-visible:ring-indigo-500/30 text-sm bg-white"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="body" className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Message
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[120px] resize-none border-slate-200 focus-visible:ring-indigo-500/30 text-sm bg-white"
            />
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

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-9 px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9 px-5 text-sm"
          >
            {loading ? (
              <><Loader2 size={13} className="animate-spin" /> Sending...</>
            ) : (
              <><Send size={13} /> Send email</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
