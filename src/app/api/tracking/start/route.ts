import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { env } from "@/env";
import { authOptions } from "@/lib/auth";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, intervalValue, intervalUnit, autoStop } = await req.json();

    if (!documentId || !intervalValue || !intervalUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await convex.query(api.users.getByEmail as any, { email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trackingJobId = await convex.mutation(api.trackingJobs.start, {
      userId: user._id,
      documentId,
      intervalValue,
      intervalUnit,
      autoStop: autoStop ?? true,
    });

    return NextResponse.json({ success: true, trackingJobId });
  } catch (error: any) {
    console.error("Start tracking error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
