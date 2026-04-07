"use client";

import { useState, use, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewersTable } from "@/components/analyse/ReviewersTable";
import { EmailModal } from "@/components/analyse/EmailModal";
import { TrackingConfigPanel } from "@/components/analyse/TrackingConfigPanel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ExternalLink, Mail, Clock, Loader2, RefreshCw } from "lucide-react";

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
  const [syncing, setSyncing] = useState(false);

  const document = useQuery(api.documents.getByFileId, { fileId: docId });
  const trackingJob = useQuery(api.trackingJobs.getByDocument, document?._id ? { documentId: document._id } : "skip" as any);

  const approvalData = useMemo(() => {
    if (!document) return null;
    const snap = document.latestApprovalSnapshot;
    return {
      approvalId: snap?.approvalId || "Unknown",
      title: document.title || "Untitled Document",
      createTime: snap?.createTime ? new Date(snap.createTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "N/A",
      modifyTime: snap?.modifyTime ? new Date(snap.modifyTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "N/A",
      status: (snap?.status as "APPROVED" | "PENDING" | "DECLINED" | "CANCELLED") || "PENDING",
      isTrackingActive: !!trackingJob?.active,
      trackingText: trackingJob?.active 
        ? `Tracking: Every ${trackingJob.intervalValue} ${trackingJob.intervalUnit}` 
        : "",
      reviewers: (snap?.reviewerResponses || []).map((r: any) => ({
        name: r.reviewer?.displayName || "Unknown",
        email: r.reviewer?.emailAddress || "",
        response: r.response as "NO_RESPONSE" | "APPROVED" | "DECLINED",
      })),
      _id: document._id,
    };
  }, [document, trackingJob]);

  const hasNoResponse = approvalData ? approvalData.reviewers.some((r: any) => r.response === "NO_RESPONSE") : false;

  const openEmailModal = (email: string) => {
    setTargetEmail(email);
    setEmailModalOpen(true);
  };

  const handleSyncNow = async () => {
    if (!document) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileId: docId, 
          category: document.category, 
          subcategory: document.subcategory 
        }),
      });
      if (!res.ok) throw new Error("Sync failed");
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleRemindAll = () => {
    if (!approvalData) return;
    const emails = approvalData.reviewers
      .filter((r: any) => r.response === "NO_RESPONSE")
      .map((r: any) => r.email)
      .join(", ");
    openEmailModal(emails);
  };

  if (document === undefined || trackingJob === undefined) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (document === null || !approvalData) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-500 bg-white border border-dashed rounded-xl max-w-5xl mx-auto">
        Document processing or not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
        <div className="space-y-2 flex-1 pt-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 line-clamp-1">{approvalData.title}</h1>
            <div className="flex items-center gap-2">
              <a 
                href={`https://docs.google.com/document/d/${docId}`}
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                title="Open Original Document"
              >
                <ExternalLink size={18} />
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSyncNow}
                disabled={syncing}
                className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                title="Sync from Google Drive"
              >
                <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>
          {approvalData.isTrackingActive && (
             <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
               <Clock size={14} className="text-amber-500"/>
               {approvalData.trackingText}
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-white px-4 py-2 border rounded-full shadow-sm">
          <div className="flex items-center gap-2 pr-3 border-r">
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
             Live Connection
          </div>
          <div className="pl-1">
            Last Synced: {document?.lastAnalysedAt ? new Date(document.lastAnalysedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </div>
        </div>
      </div>

      {/* Summary Block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border shadow-sm text-sm">
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Approval ID</div>
          <div className="font-mono text-slate-900 truncate" title={approvalData.approvalId}>{approvalData.approvalId}</div>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Created</div>
          <div className="font-medium text-slate-900">{approvalData.createTime}</div>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Last Modified</div>
          <div className="font-medium text-slate-900">{approvalData.modifyTime}</div>
        </div>
        <div className="space-y-1 md:text-right">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Status</div>
          <Badge variant={statusColorMap[approvalData.status] as any || "secondary"} className="font-bold">
            {approvalData.status}
          </Badge>
        </div>
      </div>

      {/* Reviewers Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Reviewers & Responses</h2>
        <ReviewersTable reviewers={approvalData.reviewers} onRemind={openEmailModal} />
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t mt-8">
        <Button 
          variant="outline" 
          onClick={() => setTrackingPanelOpen(true)}
          className="w-full sm:w-auto"
        >
          <Clock className="w-4 h-4 mr-2" />
          {approvalData.isTrackingActive ? "Manage Tracking" : "Turn on Tracking"}
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

      <EmailModal 
        open={emailModalOpen} 
        onOpenChange={setEmailModalOpen} 
        email={targetEmail} 
        docTitle={approvalData.title}
        docUrl={`https://docs.google.com/document/d/${docId}`}
      />
      <TrackingConfigPanel 
        open={trackingPanelOpen} 
        onOpenChange={setTrackingPanelOpen} 
        isTrackingActive={approvalData.isTrackingActive} 
        documentId={approvalData._id}
        initialIntervalValue={trackingJob?.intervalValue}
        initialIntervalUnit={trackingJob?.intervalUnit as any}
        initialAutoStop={trackingJob?.autoStop}
      />
    </div>
  );
}
