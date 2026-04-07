"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export function EmailModal({ open, onOpenChange, email }: EmailModalProps) {
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
            <Input id="to" defaultValue={email} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" defaultValue="Approval Reminder: {Document Title}" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Body</Label>
            <div className="relative">
              <Textarea 
                id="body" 
                defaultValue="Kindly review the document {Document Link} sent for approval and update the status accordingly."
                className="min-h-[120px]"
              />
              {/* Highlight trick for later: absolute div behind textarea mapping layout could stylize variables */}
            </div>
            <p className="text-[10px] text-slate-500">
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-1 rounded inline-block mb-1">{`{Document Link}`}</span> and <span className="font-semibold text-indigo-600 bg-indigo-50 px-1 rounded inline-block mb-1">{`{Document Title}`}</span> will be automatically replaced.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)} className="bg-indigo-600 hover:bg-indigo-700">Send Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
