"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../convex/_generated/api";

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  docTitle?: string;
  docUrl?: string;
}

export function EmailModal({ open, onOpenChange, email, docTitle, docUrl }: EmailModalProps) {
  const { data: session } = useSession();
  const user = useQuery(api.users.getByEmail as any, session?.user?.email ? { email: session.user.email } : "skip");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      let defaultSubject = user?.reminderSubject || "Approval Reminder: {Document Title}";
      let defaultBody = user?.reminderBody || "Kindly review the document {Document Link} sent for approval and update the status accordingly.";

      const title = docTitle || "Untitled Document";
      const link = docUrl || "#";

      setSubject(defaultSubject.replace(/{Document Title}/g, title));
      setBody(defaultBody.replace(/{Document Link}/g, link).replace(/{Document Title}/g, title));
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Reminder</DialogTitle>
          <DialogDescription>
            Customize the reminder email before sending.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" value={email} readOnly disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Body</Label>
            <div className="relative">
              <Textarea 
                id="body" 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSend} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
