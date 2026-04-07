import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { env } from "@/env";
import { authOptions } from "@/lib/auth";
import { fetchReviewerTimestamps } from "../../../../convex/lib/fetchReviewerTimestamps";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if token refresh failed (e.g. refresh token revoked)
    const tokenError = (session as any).tokenError as string | undefined;
    if (tokenError) {
      return NextResponse.json(
        { error: "Your Google session has expired. Please sign out and sign back in to re-authorize." },
        { status: 401 }
      );
    }

    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: "No access token. Please sign out and sign back in." }, { status: 401 });
    }

    const { fileId, category, subcategory } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    // Debug: verify which Google account the token belongs to
    const tokenInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );
    const tokenInfo = await tokenInfoRes.json();
    console.log("[analyse] Token info:", {
      email: tokenInfo.email,
      expires_in: tokenInfo.expires_in,
      scope: tokenInfo.scope,
      error: tokenInfo.error,
    });

    // 2. Fetch title from Drive API
    // supportsAllDrives=true is REQUIRED for files in Shared Drives — without it Drive returns 404
    const titleRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name&supportsAllDrives=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!titleRes.ok) {
      const errBody = await titleRes.json().catch(() => ({}));
      console.error(`[analyse] Drive files.get failed [${titleRes.status}]:`, JSON.stringify(errBody));
      if (titleRes.status === 401) {
        return NextResponse.json(
          { error: "Google access token is invalid or expired. Please sign out and sign back in." },
          { status: 401 }
        );
      }
      if (titleRes.status === 404) {
        return NextResponse.json(
          { error: "Document not found. Ensure the URL is correct and the file is shared with the Google account you signed in with." },
          { status: 404 }
        );
      }
      if (titleRes.status === 403) {
        return NextResponse.json(
          { error: "Access denied. Please ensure you have at least view access to the document." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Google Drive error: ${errBody?.error?.message || titleRes.statusText}` },
        { status: titleRes.status }
      );
    }
    const titleData = await titleRes.json();
    const title = titleData.name;
    console.log(`[analyse] Fetched title for ${fileId}: "${title}"`);

    // 3. Fetch approval status (Google Workspace Approvals API)
    // Also requires supportsAllDrives for Shared Drive files
    const fields = "items(approvalId,status,createTime,modifyTime,reviewerResponses(reviewer(emailAddress,displayName),response))";
    const approvalsRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/approvals?fields=${encodeURIComponent(fields)}`,
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

        // Enrich with per-reviewer action timestamps from Drive Activity API
        if (latestApprovalSnapshot.reviewerResponses) {
          const timestampMap = await fetchReviewerTimestamps(fileId, accessToken);
          latestApprovalSnapshot.reviewerResponses = latestApprovalSnapshot.reviewerResponses.map((r: any) => ({
            ...r,
            actionTime: timestampMap[r.reviewer.emailAddress?.toLowerCase()] ?? null,
          }));
        }
      }
    } else {
      const errBody = await approvalsRes.json().catch(() => ({}));
      console.error(`[analyse] Approvals fetch failed [${approvalsRes.status}]:`, JSON.stringify(errBody));
      console.warn(`[analyse] Continuing without approval data due to fetch error.`);
    }

    // 4. Resolve Convex user by email and upsert the document
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
