"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface TrackingPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTrackingActive: boolean;
}

export function TrackingConfigPanel({ open, onOpenChange, isTrackingActive }: TrackingPanelProps) {
  const [autoStop, setAutoStop] = useState(true);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] px-6">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle>Tracking Configuration</SheetTitle>
          <SheetDescription>
            Configure automated reminders for pending reviewers.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-slate-900 border-b pb-1">Interval Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval-value">Every</Label>
                <Input id="interval-value" type="number" defaultValue="6" min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval-unit">Unit</Label>
                <Select defaultValue="hours">
                  <SelectTrigger id="interval-unit">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-slate-900 border-b pb-1">Behaviors</h4>
            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="auto-stop" className="flex-1 cursor-pointer">
                <div className="font-medium">Auto-stop on terminal status</div>
                <div className="text-xs text-slate-500 mt-1">Automatically stop tracking when document is APPROVED or DECLINED.</div>
              </Label>
              <button 
                id="auto-stop"
                role="switch"
                aria-checked={autoStop}
                onClick={() => setAutoStop(!autoStop)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${autoStop ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${autoStop ? 'translate-x-[8px]' : '-translate-x-[8px]'}`} />
              </button>
            </div>
            <AnimatePresence>
              {autoStop && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded border border-indigo-100"
                >
                  Tracking will automatically halt avoiding unnecessary pings once consensus is reached.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-6 border-t">
            {isTrackingActive ? (
              <Button variant="destructive" className="w-full" onClick={() => onOpenChange(false)}>
                Stop Tracking
              </Button>
            ) : (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => onOpenChange(false)}>
                Save & Start Tracking
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
