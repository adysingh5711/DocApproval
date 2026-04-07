import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
  handler: async (ctx, args) => {
    const unitMs = { hours: 3600000, days: 86400000, weeks: 604800000 };
    const intervalMs = args.intervalValue * unitMs[args.intervalUnit];
    
    // Check if job already exists
    const existing = await ctx.db
      .query("trackingJobs")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .unique();

    const nextRunAt = Date.now() + intervalMs;
    
    // Schedule the first run
    const convexJobId = await ctx.scheduler.runAt(nextRunAt, internal.trackingJobs.runTrackingJob, {
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
    // Note: since this is an action, we can't directly read the DB, we have to call queries/mutations
    // But since the actual API call logic for Google is happening here we might need a Next.js API route to be called if we don't do fetch here.
    // However, we can use `fetch` here to call our Next.js API route that has the googleapis logic!
    // Or we can fetch the user token via a mutation/query and do `fetch` to Google Drive API directly here.
    // For simplicity, we can fetch the user tokens and then use Node's `fetch` to call Google API.
    
    const userTokens = await ctx.runQuery(internal.users.getTokens, { googleId: "" }); // actually we should pass googleId or internal getTokens by userId
    // Wait, let's create a query to get tokens by UserId!
  },
});
