export interface GoogleProfile {
  name: string;
  photoUrl: string | null;
  email: string;
  jobTitle: string | null;
  company: string | null;
  contactsUrl: string | null;
  chatDmUrl: string | null;
}

/**
 * Fetches a Google Profile for a given email using the People API.
 * This logic handles searching contacts, directory, and self-profile.
 */
export async function fetchGoogleProfile(
  email: string,
  accessToken: string,
  sessionUserEmail?: string
): Promise<GoogleProfile | null> {
  try {
    let person: any = null;
    let numericId = "";

    // 0. If it's the current user, try to get their own profile directly
    if (sessionUserEmail && email === sessionUserEmail) {
      try {
        const selfUrl = `https://people.googleapis.com/v1/people/me?personFields=names,photos,emailAddresses,organizations,metadata`;
        const selfRes = await fetch(selfUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store'
        });
        if (selfRes.ok) {
          person = await selfRes.json();
          console.log(`[google-people] Found via people/me (Self)`);
        }
      } catch (e) {
        console.error(`[google-people] Error fetching self profile:`, e);
      }
    }

    // 1. Try People API Search Contacts (Includes linked profiles)
    if (!person) {
      const searchUrl = `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(email)}&readMask=names,photos,emailAddresses,organizations`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          person = searchData.results[0].person;
          console.log(`[google-people] Found via searchContacts: ${person.resourceName}`);
        }
      }
    }

    // 2. Fallback: Try Search Directory People (For Workspace users not in contacts)
    if (!person) {
      const directoryUrl = `https://people.googleapis.com/v1/people:searchDirectoryPeople?query=${encodeURIComponent(email)}&readMask=names,photos,emailAddresses,organizations&sources=DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE`;
      const directoryRes = await fetch(directoryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
      });
      if (directoryRes.ok) {
        const directoryData = await directoryRes.json();
        if (directoryData.people && directoryData.people.length > 0) {
          person = directoryData.people[0];
          console.log(`[google-people] Found via searchDirectoryPeople: ${person.resourceName}`);
        }
      }
    }

    if (!person) {
      return null;
    }

    // 3. ID Extraction
    const profileSource = person.metadata?.sources?.find((s: any) => 
      s.type === "PROFILE" || s.type === "DOMAIN_PROFILE"
    );
    
    if (profileSource) {
      numericId = profileSource.id;
    } 
    
    if (!numericId) {
      const rName = person.resourceName || "";
      const stripped = rName.replace("people/", "");
      if (/^\d+$/.test(stripped)) {
        numericId = stripped;
      }
    }

    // Last Resort: contact resolving
    if (!numericId && person.resourceName?.includes("/c")) {
      try {
        const getRes = await fetch(`https://people.googleapis.com/v1/${person.resourceName}?personFields=metadata`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (getRes.ok) {
          const fullPerson = await getRes.json();
          const linkedProfile = fullPerson?.metadata?.sources?.find((s: any) => 
            s.type === "PROFILE" || s.type === "DOMAIN_PROFILE"
          );
          if (linkedProfile) numericId = linkedProfile.id;
        }
      } catch (e) {
        console.warn(`[google-people] Failed to resolve contact profile: ${e}`);
      }
    }

    const isNumeric = /^\d+$/.test(numericId);

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
            memberships: [{ 
              member: { 
                name: `users/${numericId}`, 
                type: "HUMAN" 
              } 
            }],
          }),
        });
        
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const spaceToken = chatData.name?.split("/")[1];
          if (spaceToken) {
            chatDmUrl = `https://chat.google.com/u/0/dm/${spaceToken}`;
          }
        }
      } catch (e) {
        // Silently fail chat DM resolve
      }
    }

    return {
      name: person.names?.[0]?.displayName || "Unknown",
      photoUrl: person.photos?.[0]?.url || null,
      email: person.emailAddresses?.[0]?.value || email,
      jobTitle: person.organizations?.[0]?.title || null,
      company: person.organizations?.[0]?.name || null,
      contactsUrl,
      chatDmUrl,
    };
  } catch (error: any) {
    console.error("[google-people] fetchGoogleProfile error:", error);
    return null;
  }
}
