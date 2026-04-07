import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const accessToken = (session as any).accessToken;

    // Use People API to search for the person by email
    // readMask includes names, photos, emailAddresses, and organizations (for job title)
    const url = `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(email)}&readMask=names,photos,emailAddresses,organizations`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("People API error:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: response.status });
    }

    const data = await response.json();
    
    // searchContacts returns an array of results
    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ person: null });
    }

    // Extract the person data from the first result
    const person = data.results[0].person;
    
    return NextResponse.json({
      person: {
        name: person.names?.[0]?.displayName || "Unknown",
        photoUrl: person.photos?.[0]?.url || null,
        email: person.emailAddresses?.[0]?.value || email,
        jobTitle: person.organizations?.[0]?.title || null,
        company: person.organizations?.[0]?.name || null,
      }
    });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
