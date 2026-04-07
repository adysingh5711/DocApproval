import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { env } from "@/env";
import { authOptions } from "@/lib/auth";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

// Helper to get userId from session
async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;
  const user = await convex.query(api.users.getByEmail as any, { email: session.user.email });
  return user?._id || null;
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await convex.query(api.categories.getByUser, { userId });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, name, categoryId } = body;

    if (action === "addCategory") {
      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      await convex.mutation(api.categories.addCategory, { userId, name });
    } else if (action === "addSubcategory") {
      if (!name || !categoryId) return NextResponse.json({ error: "Name and CategoryId are required" }, { status: 400 });
      await convex.mutation(api.categories.addSubcategory, { categoryId, name });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    const subcategoryName = url.searchParams.get("subcategoryName");

    if (!categoryId) return NextResponse.json({ error: "categoryId is required" }, { status: 400 });

    if (subcategoryName) {
      await convex.mutation(api.categories.removeSubcategory, { categoryId: categoryId as any, name: subcategoryName });
    } else {
      await convex.mutation(api.categories.removeCategory, { categoryId: categoryId as any });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
