import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByFileId = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .unique();
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const upsertDocument = mutation({
  args: {
    userId: v.id("users"),
    fileId: v.string(),
    title: v.string(),
    docUrl: v.string(),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    lastAnalysedAt: v.number(),
    latestApprovalSnapshot: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .unique();

    if (existing) {
      if (existing.userId !== args.userId) {
        throw new Error("Document belongs to a different user");
      }
      
      const updates = {
        title: args.title,
        docUrl: args.docUrl,
        category: args.category || existing.category,
        subcategory: args.subcategory || existing.subcategory,
        lastAnalysedAt: args.lastAnalysedAt,
        latestApprovalSnapshot: args.latestApprovalSnapshot,
      };
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("documents", args);
    }
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // Also delete any tracking jobs for this document
    const jobs = await ctx.db
      .query("trackingJobs")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();
      
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }
    
    await ctx.db.delete(args.documentId);
  },
});
