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
    reminderSubject: v.optional(v.string()), // Template subject
    reminderBody: v.optional(v.string()), // Template body
  }).index("by_googleId", ["googleId"])
    .index("by_email", ["email"]), // Add email index for faster lookup during API requests

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
    // --- NEW ---
    autoSendReminder: v.optional(v.boolean()),      // whether to email on each tick
    reminderRecipients: v.optional(v.array(v.string())), // reviewer emails to remind
    reminderOnlyPending: v.optional(v.boolean()),   // only email reviewers who haven't responded yet
  }).index("by_documentId", ["documentId"])
    .index("by_userId", ["userId"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    subcategories: v.array(v.string()),
  }).index("by_userId", ["userId"]),
});
