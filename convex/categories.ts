import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const addCategory = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();

    if (existing) {
      throw new Error("Category already exists");
    }

    return await ctx.db.insert("categories", {
      userId: args.userId,
      name: args.name,
      subcategories: [], // Initialize with empty subcategories
    });
  },
});

export const addSubcategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.subcategories.includes(args.name)) {
      throw new Error("Subcategory already exists");
    }

    const subcategories = [...category.subcategories, args.name];
    await ctx.db.patch(args.categoryId, { subcategories });
  },
});

export const removeCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.categoryId);
  },
});

export const removeSubcategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) return;

    const subcategories = category.subcategories.filter((s) => s !== args.name);
    await ctx.db.patch(args.categoryId, { subcategories });
  },
});
