import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get access token from JWT
    const token = await getToken({ req });
    const accessToken = token?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token. Please sign out and sign back in." }, { status: 401 });
    }

    let person: any = null;
    let numericId = "";

    // 1. Try People API Search Contacts (Includes linked profiles)
    // We add 'metadata' and 'externalIds' to help find the Gaia ID
    const searchUrl = `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(email)}&readMask=names,photos,emailAddresses,organizations,metadata,externalIds`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.results && searchData.results.length > 0) {
        person = searchData.results[0].person;
        console.log(`[profile] Found via searchContacts: ${person.resourceName}`);
      }
    }

    // 2. Fallback: Try Search Directory People (For Workspace users not in contacts)
    if (!person) {
      const directoryUrl = `https://people.googleapis.com/v1/people:searchDirectoryPeople?query=${encodeURIComponent(email)}&readMask=names,photos,emailAddresses,organizations,metadata&sources=DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE`;
      const directoryRes = await fetch(directoryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (directoryRes.ok) {
        const directoryData = await directoryRes.json();
        if (directoryData.people && directoryData.people.length > 0) {
          person = directoryData.people[0];
          console.log(`[profile] Found via searchDirectoryPeople: ${person.resourceName}`);
        }
      }
    }

    if (!person) {
      console.warn(`[profile] No person found for email: ${email}`);
      return NextResponse.json({ person: null });
    }

    // 3. Robust ID Extraction
    // First, look for the PROFILE source ID (This is the numeric Gaia ID)
    const profileSource = person.metadata?.sources?.find((s: any) => s.type === "PROFILE");
    if (profileSource) {
      numericId = profileSource.id;
    } 
    
    // Fallback: If resourceName is numeric (people/123...), use that
    if (!numericId) {
      const rName = person.resourceName || "";
      const stripped = rName.replace("people/", "");
      if (/^\d+$/.test(stripped)) {
        numericId = stripped;
      }
    }

    // Last Resort: If it's a contact (people/c123...), try to fetch the full person to resolve the profile
    if (!numericId && person.resourceName?.includes("/c")) {
      console.log(`[profile] Resolving profile for contact: ${person.resourceName}`);
      const getRes = await fetch(`https://people.googleapis.com/v1/${person.resourceName}?personFields=metadata`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (getRes.ok) {
        const fullPerson = await getRes.ok ? await getRes.json() : null;
        const linkedProfile = fullPerson?.metadata?.sources?.find((s: any) => s.type === "PROFILE");
        if (linkedProfile) {
          numericId = linkedProfile.id;
          console.log(`[profile] Resolved numericId from linked profile: ${numericId}`);
        }
      }
    }

    const isNumeric = /^\d+$/.test(numericId);
    console.log(`[profile] Final ID resolution - email: ${email}, numericId: ${numericId}, isNumeric: ${isNumeric}`);

    // 4. Build URLs
    const contactsUrl = isNumeric
      ? `https://contacts.google.com/person/${numericId}`
      : `https://contacts.google.com/search/${encodeURIComponent(email)}`;

    // 5. Chat DM space setup
    let chatDmUrl: string | null = null;
    if (isNumeric) {
      try {
        const chatRes = await fetch("https://chat.googleapis.com/v1/spaces:setup", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            space: { spaceType: "DIRECT_MESSAGE" },
            memberships: [{ member: { name: `users/${numericId}`, type: "HUMAN" } }],
          }),
        });
        
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          // name is "spaces/ABC"
          const spaceToken = chatData.name?.split("/")[1];
          if (spaceToken) {
            chatDmUrl = `https://chat.google.com/u/0/dm/${spaceToken}`;
            console.log(`[profile] Chat space resolved: ${chatDmUrl}`);
          }
        } else {
          const errBody = await chatRes.json().catch(() => ({}));
          console.warn(`[profile] Chat API error [${chatRes.status}]:`, JSON.stringify(errBody));
        }
      } catch (e) {
        console.warn("[profile] Chat DM resolve failed:", e);
      }
    }

    return NextResponse.json({
      person: {
        name: person.names?.[0]?.displayName || "Unknown",
        photoUrl: person.photos?.[0]?.url || null,
        email: person.emailAddresses?.[0]?.value || email,
        jobTitle: person.organizations?.[0]?.title || null,
        company: person.organizations?.[0]?.name || null,
        contactsUrl,
        chatDmUrl,
      },
    });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
