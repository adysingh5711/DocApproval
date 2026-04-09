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
    // --- NEW ---
    autoSendReminder: v.optional(v.boolean()),
    reminderRecipients: v.optional(v.array(v.string())),
    reminderOnlyPending: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Id<"trackingJobs">> => {
    const unitMs = { hours: 3600000, days: 86400000, weeks: 604800000 };
    const intervalMs = args.intervalValue * unitMs[args.intervalUnit];
    const existing = await ctx.db
      .query("trackingJobs")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .unique();

    const nextRunAt = Date.now() + intervalMs;
    const convexJobId: Id<"_scheduled_functions"> = await ctx.scheduler.runAt(
      nextRunAt,
      internal.trackingJobs.runTrackingJob,
      { documentId: args.documentId, userId: args.userId }
    );

    const jobFields = {
      intervalValue: args.intervalValue,
      intervalUnit: args.intervalUnit,
      intervalMs,
      autoStop: args.autoStop,
      active: true,
      nextRunAt,
      convexJobId,
      autoSendReminder: args.autoSendReminder ?? false,
      reminderRecipients: args.reminderRecipients ?? [],
      reminderOnlyPending: args.reminderOnlyPending ?? true,
    };

    if (existing) {
      if (existing.convexJobId) await ctx.scheduler.cancel(existing.convexJobId);
      await ctx.db.patch(existing._id, jobFields);
      return existing._id;
    } else {
      return await ctx.db.insert("trackingJobs", {
        userId: args.userId,
        documentId: args.documentId,
        ...jobFields,
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
    // 1. Fetch tokens, job, document
    const tokens = await ctx.runQuery(internal.users.getTokensById, { userId: args.userId });
    const job = await ctx.runQuery(api.trackingJobs.getByDocument, { documentId: args.documentId });
    const document = await ctx.runQuery(api.documents.get, { documentId: args.documentId });
    const user = await ctx.runQuery(internal.users.getById, { userId: args.userId });

    if (!tokens || !job || !document || !job.active) return;

    let accessToken = tokens.accessToken;

    // 2. Refresh token if expired
    const isExpired = !tokens.tokenExpiry || Date.now() > tokens.tokenExpiry - 60000;
    if (isExpired && tokens.refreshToken) {
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
        await ctx.runMutation(internal.users.updateTokens, {
          userId: args.userId,
          accessToken: data.access_token,
          tokenExpiry: Date.now() + data.expires_in * 1000,
        });
      } else {
        console.error("Token refresh failed:", await response.text());
        return;
      }
    }

    if (!accessToken) return;

    // 3. Fetch latest approval snapshot from Google Drive
    const approvalsRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${document.fileId}/approvals?fields=items(approvalId,status,createTime,modifyTime,reviewerResponses(reviewer(emailAddress,displayName),response))`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let latestSnapshot = null;
    if (approvalsRes.ok) {
      const data = await approvalsRes.json();
      if (data.items?.length > 0) {
        latestSnapshot = data.items.sort((a: any, b: any) =>
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        )[0];

        if (latestSnapshot.reviewerResponses) {
          const timestampMap = await fetchReviewerTimestamps(document.fileId, accessToken);
          latestSnapshot.reviewerResponses = latestSnapshot.reviewerResponses.map((r: any) => ({
            ...r,
            actionTime: timestampMap[r.reviewer.emailAddress?.toLowerCase()] ?? null,
          }));
        }
      }
    }

    // 4. Upsert document snapshot
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

    // 5. AutoStop check
    if (job.autoStop) {
      const updatedDoc = await ctx.runQuery(api.documents.get, { documentId: args.documentId });
      const terminalStatuses = ["APPROVED", "DECLINED", "CANCELLED"];
      const derivedStatus = updatedDoc?.latestApprovalSnapshot?.status ?? "";
      if (updatedDoc && terminalStatuses.includes(derivedStatus)) {
        await ctx.runMutation(api.trackingJobs.updateJobState, {
          jobId: job._id,
          updates: { active: false, convexJobId: undefined },
        });
        return; // do not reschedule, do not send reminder
      }
    }

    // 6. AUTO SEND REMINDER — runs from Convex server, no browser session needed
    if (job.autoSendReminder && job.reminderRecipients && job.reminderRecipients.length > 0) {
      const senderEmail = user?.email;
      if (senderEmail) {
        // Determine who to remind
        let targets: string[] = job.reminderRecipients;

        if (job.reminderOnlyPending && latestSnapshot?.reviewerResponses) {
          // Filter down to reviewers who have not yet responded
          const pendingEmails = new Set(
            latestSnapshot.reviewerResponses
              .filter((r: any) => !r.response || r.response === "PENDING" || r.response === "NO_RESPONSE")
              .map((r: any) => r.reviewer.emailAddress?.toLowerCase())
              .filter(Boolean)
          );
          targets = targets.filter((email) => pendingEmails.has(email.toLowerCase()));
        }

        if (targets.length > 0) {
          const subject = user?.reminderSubject
            ?.replace("{Document Title}", document.title)
            ?.replace("{Document Link}", document.docUrl)
            ?? `Action needed: Please review "${document.title}"`;

          const body = user?.reminderBody
            ?.replace("{Document Title}", document.title)
            ?.replace("{Document Link}", document.docUrl)
            ?? `Hi,\n\nThis is a reminder that "${document.title}" is awaiting your review.\n\nLink: ${document.docUrl}\n\nThank you.`;

          for (const recipientEmail of targets) {
            const rawEmail = [
              `From: ${senderEmail}`,
              `To: ${recipientEmail}`,
              `Subject: ${subject}`,
              `Content-Type: text/plain; charset=utf-8`,
              ``,
              body,
            ].join("\r\n");

            const encodedEmail = Buffer.from(rawEmail)
              .toString("base64")
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");

            const gmailRes = await fetch(
              "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ raw: encodedEmail }),
              }
            );

            if (!gmailRes.ok) {
              console.error(
                `Failed to send reminder to ${recipientEmail}:`,
                await gmailRes.text()
              );
            } else {
              console.log(`Auto-reminder sent to ${recipientEmail} for "${document.title}"`);
            }
          }
        }
      }
    }

    // 7. Schedule next run
    const nextRunAt = Date.now() + job.intervalMs;
    const convexJobId = await ctx.scheduler.runAt(nextRunAt, internal.trackingJobs.runTrackingJob, {
      documentId: args.documentId,
      userId: args.userId,
    });

    await ctx.runMutation(api.trackingJobs.updateJobState, {
      jobId: job._id,
      updates: { lastRunAt: Date.now(), nextRunAt, convexJobId },
    });
  },
});
