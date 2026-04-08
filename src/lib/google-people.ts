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
          cache: "no-store",
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
        cache: "no-store",
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
      const directoryUrl = `https://people.googleapis.com/v1/people:searchDirectoryPeople?query=${encodeURIComponent(email)}&readMask=names,photos,emailAddresses,organizations,metadata&sources=DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE`;
      const directoryRes = await fetch(directoryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
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
        const getRes = await fetch(
          `https://people.googleapis.com/v1/${person.resourceName}?personFields=metadata`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
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

    // 4. Build contacts URL
    const contactsUrl = isNumeric
      ? `https://contacts.google.com/person/${numericId}`
      : `https://contacts.google.com/search/${encodeURIComponent(email)}`;

    // 5. Chat DM URL — two-step: create via spaces:setup, then findDirectMessage for opaque token
    let chatDmUrl: string | null = null;

    if (isNumeric) {
      try {
        // Step A: Create or get existing DM space
        const setupRes = await fetch("https://chat.googleapis.com/v1/spaces:setup", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            space: { spaceType: "DIRECT_MESSAGE" },
            memberships: [{
              member: { name: `users/${numericId}`, type: "HUMAN" },
            }],
          }),
        });

        if (setupRes.ok) {
          const setupData = await setupRes.json();
          const setupToken = setupData.name?.split("/")[1];
          const setupIsOpaque = setupToken && !/^\d+$/.test(setupToken);

          if (setupIsOpaque) {
            // spaces:setup returned a real opaque token directly — use it
            chatDmUrl = `https://chat.google.com/u/0/dm/${setupToken}`;
            console.log(`[google-people] Chat DM via spaces:setup (opaque) for ${email}: ${chatDmUrl}`);
          } else {
            // Step B: spaces:setup returned numeric ID — call findDirectMessage to get real token
            console.log(`[google-people] spaces:setup returned numeric ID for ${email}, trying findDirectMessage`);

            const findRes = await fetch(
              `https://chat.googleapis.com/v1/spaces:findDirectMessage?name=users/${numericId}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (findRes.ok) {
              const findData = await findRes.json();
              const findToken = findData.name?.split("/")[1];
              const findIsOpaque = findToken && !/^\d+$/.test(findToken);

              if (findIsOpaque) {
                chatDmUrl = `https://chat.google.com/u/0/dm/${findToken}`;
                console.log(`[google-people] Chat DM via findDirectMessage for ${email}: ${chatDmUrl}`);
              } else {
                console.warn(`[google-people] findDirectMessage also returned numeric token for ${email}`);
              }
            } else {
              const errBody = await findRes.json().catch(() => ({}));
              console.warn(`[google-people] findDirectMessage error [${findRes.status}] for ${email}:`, JSON.stringify(errBody));
            }
          }
        } else {
          const errBody = await setupRes.json().catch(() => ({}));
          console.warn(`[google-people] spaces:setup error [${setupRes.status}] for ${email}:`, JSON.stringify(errBody));
        }
      } catch (e) {
        console.warn(`[google-people] Chat DM resolve error for ${email}:`, e);
      }
    }

    // Final fallback — email deep link always works, opens Chat's own DM resolution
    if (!chatDmUrl) {
      chatDmUrl = `https://chat.google.com/u/0/r/dm?authuser=0&email=${encodeURIComponent(email)}`;
      console.log(`[google-people] Chat DM fallback (email link) for ${email}`);
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
