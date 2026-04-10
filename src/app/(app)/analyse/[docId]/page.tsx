"use client";

import { useState, use, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ReviewersTable } from "@/components/analyse/ReviewersTable";
import { EmailModal } from "@/components/analyse/EmailModal";
import { TrackingConfigPanel } from "@/components/analyse/TrackingConfigPanel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ExternalLink, Mail, Clock, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  APPROVED: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
  PENDING: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" },
  DECLINED: { dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 border-rose-200", label: "Declined" },
  CANCELLED: { dot: "bg-slate-300", badge: "bg-slate-50 text-slate-500 border-slate-200", label: "Cancelled" },
};

export default function DocumentStatusPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [trackingPanelOpen, setTrackingPanelOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const document = useQuery(api.documents.getByFileId, { fileId: docId });
  const trackingJob = useQuery(
    api.trackingJobs.getByDocument,
    document?._id ? { documentId: document._id } : ("skip" as any)
  );

  const approvalData = useMemo(() => {
    if (!document) return null;
    const snap = document.latestApprovalSnapshot;
    return {
      approvalId: snap?.approvalId || "Unknown",
      title: document.title || "Untitled Document",
      createTime: snap?.createTime
        ? new Date(snap.createTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
        : "N/A",
      modifyTime: snap?.modifyTime
        ? new Date(snap.modifyTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
        : "N/A",
      status: (snap?.status as "APPROVED" | "PENDING" | "DECLINED" | "CANCELLED") || "PENDING",
      isTrackingActive: !!trackingJob?.active,
      trackingText: trackingJob?.active
        ? `Every ${trackingJob.intervalValue} ${trackingJob.intervalUnit}`
        : "",
      reviewers: (snap?.reviewerResponses || []).map((r: any) => ({
        name: r.reviewer?.displayName || "Unknown",
        email: r.reviewer?.emailAddress || "",
        response:
          r.response === "APPROVED" ? "APPROVED" :
            r.response === "REJECTED" ? "DECLINED" : "NO_RESPONSE",
        actionTime: r.actionTime || (r.response !== "NO_RESPONSE" ? snap?.modifyTime : undefined),
        profile: r.profile ?? null,
      })),
      _id: document._id,
    };
  }, [document, trackingJob]);

  const hasNoResponse = approvalData?.reviewers.some((r: any) => r.response === "NO_RESPONSE") ?? false;

  const openEmailModal = (email: string) => { setTargetEmail(email); setEmailModalOpen(true); };

  const handleSyncNow = async () => {
    if (!document) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: docId, category: document.category, subcategory: document.subcategory }),
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

  // ── Loading ──
  if (document === undefined || trackingJob === undefined) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (document === null || !approvalData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <ExternalLink size={20} />
        </div>
        <p className="text-sm text-slate-500">Document not found or still processing.</p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={13} />
            Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const sc = statusConfig[approvalData.status] ?? statusConfig.PENDING;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Back link ── */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={12} />
        Dashboard
      </Link>

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">
              {approvalData.title}
            </h1>
            <a
              href={`https://docs.google.com/document/d/${docId}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Open in Google Docs"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
              title="Sync from Google Drive"
            >
              <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>

            {/* Tracking pill */}
            {approvalData.isTrackingActive && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Tracking · {approvalData.trackingText}
              </span>
            )}
          </div>
        </div>

        {/* Last synced */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-100 px-3 py-2 rounded-xl shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Last synced:{" "}
          <span className="font-medium text-slate-700">
            {document?.lastAnalysedAt
              ? new Date(document.lastAnalysedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Never"}
          </span>
        </div>
      </div>

      {/* ── Meta block ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Approval ID", value: approvalData.approvalId, mono: true },
          { label: "Created", value: approvalData.createTime },
          { label: "Last modified", value: approvalData.modifyTime },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-100 rounded-xl px-4 py-3 space-y-1"
          >
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {item.label}
            </p>
            <p
              className={`text-sm text-slate-900 truncate ${item.mono ? "font-mono text-xs" : "font-medium"}`}
              title={item.value}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Reviewers ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Reviewers & responses</h2>
          <span className="text-xs text-slate-400">
            {approvalData.reviewers.length} reviewer{approvalData.reviewers.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ReviewersTable reviewers={approvalData.reviewers} onRemind={openEmailModal} />
      </div>

      {/* ── Action bar ── */}
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 mb-12">
        <Button
          variant="outline"
          onClick={() => setTrackingPanelOpen(true)}
          className="w-full sm:w-auto border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 gap-2 transition-all"
        >
          <Clock size={15} />
          {approvalData.isTrackingActive ? "Manage tracking" : "Turn on tracking"}
        </Button>
        <Button
          onClick={handleRemindAll}
          disabled={!hasNoResponse}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
        >
          <Mail size={15} />
          Send reminder to all
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
