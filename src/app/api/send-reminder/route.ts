import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get access token from JWT
    const token = await getToken({ req });
    const accessToken = token?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token. Please sign out and sign back in." }, { status: 401 });
    }

    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Composing the raw email RFC 2822 format
    const toRecipients = Array.isArray(to) ? to.join(", ") : to;
    
    const emailLines = [
      `From: ${session.user.email}`,
      `To: ${toRecipients}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      "",
      body,
    ];

    const rawEmail = emailLines.join("\r\n");
    // Base64URL encode the raw email
    const encodedEmail = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!gmailRes.ok) {
      const errorData = await gmailRes.json();
      return NextResponse.json({ error: "Failed to send email via Gmail API", details: errorData }, { status: gmailRes.status });
    }

    const { id } = await gmailRes.json();
    return NextResponse.json({ success: true, messageId: id });
  } catch (error: any) {
    console.error("Send reminder error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
