import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getTokens = query({
  args: { googleId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .unique();
    return user ? {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      tokenExpiry: user.tokenExpiry,
      userId: user._id,
    } : null;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Wait, we didn't index by email. We can just filter. Or index it.
    // Filtering is fine for a small scale users table, but let's just filter.
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();
  },
});

export const getTokensById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user ? {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      tokenExpiry: user.tokenExpiry,
    } : null;
  },
});

export const upsertUserTokens = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    googleId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .unique();

    if (existing) {
      // Only update tokens if they are provided, else keep existing
      const updates: any = {};
      if (args.accessToken !== undefined) updates.accessToken = args.accessToken;
      if (args.refreshToken !== undefined) updates.refreshToken = args.refreshToken;
      if (args.tokenExpiry !== undefined) updates.tokenExpiry = args.tokenExpiry;
      
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        googleId: args.googleId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiry: args.tokenExpiry,
      });
    }
  },
});
