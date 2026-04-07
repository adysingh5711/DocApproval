import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    googleId: v.string(),
    accessToken: v.optional(v.string()), // Optional because it might not be set initially
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  }).index("by_googleId", ["googleId"]), // Helpful to lookup user by googleId securely

  documents: defineTable({
    userId: v.id("users"),
    fileId: v.string(),
    title: v.string(),
    docUrl: v.string(),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    lastAnalysedAt: v.number(),
    latestApprovalSnapshot: v.any(), // Keeping it "any" to hold generic JSON
  }).index("by_userId", ["userId"])
    .index("by_fileId", ["fileId"]),

  trackingJobs: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    intervalValue: v.number(),
    intervalUnit: v.union(v.literal("hours"), v.literal("days"), v.literal("weeks")),
    intervalMs: v.number(),
    autoStop: v.boolean(),
    active: v.boolean(),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.number(),
    convexJobId: v.optional(v.id("_scheduled_functions")),
  }).index("by_documentId", ["documentId"])
    .index("by_userId", ["userId"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    subcategories: v.array(v.string()),
  }).index("by_userId", ["userId"]),
});
