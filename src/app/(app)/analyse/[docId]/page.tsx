"use client";

import { useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewersTable } from "@/components/analyse/ReviewersTable";
import { EmailModal } from "@/components/analyse/EmailModal";
import { TrackingConfigPanel } from "@/components/analyse/TrackingConfigPanel";
import { ExternalLink, Mail, Clock } from "lucide-react";

const mockApprovalData = {
  approvalId: "app-abc123xyz987",
  title: "Q3 Marketing Campaign Brief",
  createTime: "5 Dec 2025, 10:28 AM IST",
  modifyTime: "5 Dec 2025, 12:56 PM IST",
  status: "PENDING" as "APPROVED" | "PENDING" | "DECLINED" | "CANCELLED",
  isTrackingActive: true,
  trackingText: "Tracking: Every 6 hours",
  reviewers: [
    { name: "Karl Smith", email: "karl@atlasconsolidated.com", response: "NO_RESPONSE" as const },
    { name: "Namisha Jain", email: "namisha@hugohub.com", response: "APPROVED" as const },
    { name: "Braham Singh", email: "braham@atlasconsolidated.com", response: "DECLINED" as const },
  ]
};

const statusColorMap = {
  APPROVED: "success",
  PENDING: "warning",
  DECLINED: "danger",
  CANCELLED: "secondary",
} as const;

export default function DocumentStatusPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [trackingPanelOpen, setTrackingPanelOpen] = useState(false);

  const hasNoResponse = mockApprovalData.reviewers.some(r => r.response === "NO_RESPONSE");

  const openEmailModal = (email: string) => {
    setTargetEmail(email);
    setEmailModalOpen(true);
  };

  const handleRemindAll = () => {
    const emails = mockApprovalData.reviewers
      .filter(r => r.response === "NO_RESPONSE")
      .map(r => r.email)
      .join(", ");
    openEmailModal(emails);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
        <div className="space-y-2 flex-1 pt-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 line-clamp-1">{mockApprovalData.title}</h1>
            <a 
              href={`https://docs.google.com/document/d/${docId}`}
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Open Original Document"
            >
              <ExternalLink size={20} />
            </a>
          </div>
          {mockApprovalData.isTrackingActive && (
             <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
               <Clock size={14} className="text-amber-500"/>
               {mockApprovalData.trackingText}
             </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 bg-white px-4 py-2 border rounded-full shadow-sm">
          <div className="h-6 w-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 shrink-0">U</div>
          Current User
        </div>
      </div>

      {/* Summary Block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border shadow-sm text-sm">
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Approval ID</div>
          <div className="font-mono text-slate-900 truncate" title={mockApprovalData.approvalId}>{mockApprovalData.approvalId}</div>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Created</div>
          <div className="font-medium text-slate-900">{mockApprovalData.createTime}</div>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Last Modified</div>
          <div className="font-medium text-slate-900">{mockApprovalData.modifyTime}</div>
        </div>
        <div className="space-y-1 md:text-right">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Status</div>
          <Badge variant={statusColorMap[mockApprovalData.status] as any} className="font-bold">
            {mockApprovalData.status}
          </Badge>
        </div>
      </div>

      {/* Reviewers Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Reviewers & Responses</h2>
        <ReviewersTable reviewers={mockApprovalData.reviewers} onRemind={openEmailModal} />
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t mt-8">
        <Button 
          variant="outline" 
          onClick={() => setTrackingPanelOpen(true)}
          className="w-full sm:w-auto"
        >
          <Clock className="w-4 h-4 mr-2" />
          {mockApprovalData.isTrackingActive ? "Manage Tracking" : "Turn on Tracking"}
        </Button>
        <Button 
          onClick={handleRemindAll} 
          disabled={!hasNoResponse}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
        >
          <Mail className="w-4 h-4 mr-2" />
          Send Reminder to All
        </Button>
      </div>

      <EmailModal open={emailModalOpen} onOpenChange={setEmailModalOpen} email={targetEmail} />
      <TrackingConfigPanel 
        open={trackingPanelOpen} 
        onOpenChange={setTrackingPanelOpen} 
        isTrackingActive={mockApprovalData.isTrackingActive} 
      />
    </div>
  );
}
