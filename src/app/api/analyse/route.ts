import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session || !(session as any).accessToken || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = (session as any).accessToken;
    const { fileId, category, subcategory } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    // 2. Fetch title from Drive API
    const titleRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!titleRes.ok) {
      return NextResponse.json({ error: "Failed to fetch document metadata" }, { status: titleRes.status });
    }
    const titleData = await titleRes.json();
    const title = titleData.name;

    // 3. Fetch approvals
    const approvalsRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/approvals?fields=items(approvalId,status,createTime,modifyTime,reviewerResponses(reviewer(emailAddress,displayName),response))`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    let latestApprovalSnapshot = null;
    if (approvalsRes.ok) {
      const approvalsData = await approvalsRes.json();
      if (approvalsData.items && approvalsData.items.length > 0) {
        latestApprovalSnapshot = approvalsData.items.sort(
          (a: any, b: any) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        )[0];
      }
    }

    // 4. Update Convex (Find user by email to get user ID first)
    // Wait, the NextAuth session has email. Let's use `googleId` or get userId.
    // Instead we can just pass the email or googleId we got from session.
    // A more direct way is to add a mutation/query to get user by email.
    // Assuming `upsertUserTokens` created the user, we can query by email.
    // Let's rely on a new query or just let the front-end supply the Convex user ID?
    // Frontend could pass `userId` but server should verify.
    // Let's add a query in convex `users.ts` called `getByEmail`.
    
    // For now, let's assume we implement it:
    const user = await convex.query(api.users.getByEmail as any, { email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
    }

    const documentId = await convex.mutation(api.documents.upsertDocument, {
      userId: user._id,
      fileId,
      title,
      docUrl: `https://docs.google.com/document/d/${fileId}/edit`,
      category,
      subcategory,
      lastAnalysedAt: Date.now(),
      latestApprovalSnapshot,
    });

    return NextResponse.json({ success: true, documentId, title, latestApprovalSnapshot });
  } catch (error: any) {
    console.error("Analyse error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
