import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { fetchReviewerTimestamps } from "./lib/fetchReviewerTimestamps";

export const getByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trackingJobs")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .unique();
  },
});

export const start = mutation({
  args: {
    userId: v.id("users"),
    documentId: v.id("documents"),
    intervalValue: v.number(),
    intervalUnit: v.union(v.literal("hours"), v.literal("days"), v.literal("weeks")),
    autoStop: v.boolean(),
  },
  handler: async (ctx, args): Promise<Id<"trackingJobs">> => {
    const unitMs = { hours: 3600000, days: 86400000, weeks: 604800000 };
    const intervalMs = args.intervalValue * unitMs[args.intervalUnit];

    // Check if job already exists
    const existing = await ctx.db
      .query("trackingJobs")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .unique();

    const nextRunAt = Date.now() + intervalMs;

    // Schedule the first run
    const convexJobId: Id<"_scheduled_functions"> = await ctx.scheduler.runAt(nextRunAt, internal.trackingJobs.runTrackingJob, {
      documentId: args.documentId,
      userId: args.userId,
    });

    if (existing) {
      if (existing.convexJobId) {
        await ctx.scheduler.cancel(existing.convexJobId);
      }
      await ctx.db.patch(existing._id, {
        intervalValue: args.intervalValue,
        intervalUnit: args.intervalUnit,
        intervalMs,
        autoStop: args.autoStop,
        active: true,
        nextRunAt,
        convexJobId,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("trackingJobs", {
        userId: args.userId,
        documentId: args.documentId,
        intervalValue: args.intervalValue,
        intervalUnit: args.intervalUnit,
        intervalMs,
        autoStop: args.autoStop,
        active: true,
        nextRunAt,
        convexJobId,
      });
    }
  },
});

export const stop = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trackingJobs")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .unique();

    if (existing) {
      if (existing.convexJobId) {
        await ctx.scheduler.cancel(existing.convexJobId);
      }
      await ctx.db.patch(existing._id, {
        active: false,
        convexJobId: undefined,
      });
    }
  },
});

// A helper mutation to update job state from the action
export const updateJobState = mutation({
  args: {
    jobId: v.id("trackingJobs"),
    updates: v.any(), // { active, convexJobId, nextRunAt, lastRunAt }
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, args.updates);
  }
});

export const runTrackingJob = internalAction({
  args: { documentId: v.id("documents"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // 1. Get tokens and job info
    const tokens = await ctx.runQuery(internal.users.getTokensById, { userId: args.userId });
    const job = await ctx.runQuery(api.trackingJobs.getByDocument, { documentId: args.documentId });
    const document = await ctx.runQuery(api.documents.get, { documentId: args.documentId });

    if (!tokens || !job || !document || !job.active) return;

    let accessToken = tokens.accessToken;

    // 2. Refresh token if expired (or missing)
    const isExpired = !tokens.tokenExpiry || Date.now() > tokens.tokenExpiry - 60000; // 1 min buffer
    if (isExpired && tokens.refreshToken) {
      console.log("Token expired for user", args.userId, "- refreshing...");
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: tokens.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        accessToken = data.access_token;
        const expiry = Date.now() + data.expires_in * 1000;

        await ctx.runMutation(internal.users.updateTokens, {
          userId: args.userId,
          accessToken: data.access_token,
          tokenExpiry: expiry,
        });

        // Note: My existing upsertUserTokens mutation uses googleId to lookup.
        // We might need a generic `updateUserTokens` mutation for actions.
      } else {
        console.error("Failed to refresh token", await response.text());
        return;
      }
    }

    if (!accessToken) return;

    // 3. Fetch latest from Google Drive
    console.log("Syncing document", document.title, "(", args.documentId, ")");

    const approvalsRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${document.fileId}/approvals?fields=items(approvalId,status,createTime,modifyTime,reviewerResponses(reviewer(emailAddress,displayName),response))`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let latestSnapshot = null;
    if (approvalsRes.ok) {
      const data = await approvalsRes.json();
      if (data.items?.length > 0) {
        latestSnapshot = data.items.sort((a: any, b: any) =>
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime())[0];

        // Enrich with per-reviewer action timestamps from Drive Activity API
        if (latestSnapshot.reviewerResponses) {
          const timestampMap = await fetchReviewerTimestamps(document.fileId, accessToken);
          latestSnapshot.reviewerResponses = latestSnapshot.reviewerResponses.map((r: any) => ({
            ...r,
            actionTime: timestampMap[r.reviewer.emailAddress?.toLowerCase()] ?? null,
          }));
        }
      }
    }

    // 4. Update the document snapshot - preserve existing category/subcategory
    await ctx.runMutation(api.documents.upsertDocument, {
      userId: args.userId,
      fileId: document.fileId,
      title: document.title,
      docUrl: document.docUrl,
      category: document.category,
      subcategory: document.subcategory,
      lastAnalysedAt: Date.now(),
      latestApprovalSnapshot: latestSnapshot,
    });

    // After upsertDocument, check autoStop
    if (job.autoStop) {
      const updatedDoc = await ctx.runQuery(api.documents.get, { documentId: args.documentId });
      const terminalStatuses = ["APPROVED", "DECLINED", "CANCELLED"];
      if (updatedDoc && terminalStatuses.includes(updatedDoc.latestApprovalSnapshot?.status ?? "")) {
        await ctx.runMutation(api.trackingJobs.updateJobState, {
          jobId: job._id,
          updates: { active: false, convexJobId: undefined },
        });
        return;
      }
    }

    // 5. Schedule the next run
    const nextRunAt = Date.now() + job.intervalMs;
    const convexJobId = await ctx.scheduler.runAt(nextRunAt, internal.trackingJobs.runTrackingJob, {
      documentId: args.documentId,
      userId: args.userId,
    });

    // 6. Update job state
    await ctx.runMutation(api.trackingJobs.updateJobState, {
      jobId: job._id,
      updates: {
        lastRunAt: Date.now(),
        nextRunAt,
        convexJobId,
      }
    });
  },
});
