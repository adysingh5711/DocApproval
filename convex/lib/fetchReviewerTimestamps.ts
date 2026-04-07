export async function fetchReviewerTimestamps(
  fileId: string,
  accessToken: string
): Promise<Record<string, string>> {
  // Returns { emailAddress (lowercase) -> ISO timestamp }

  console.log(`[fetchReviewerTimestamps] Fetching activity for file: ${fileId}`);

  // 1. Fetch all activity for the file with consolidation disabled
  const activityRes = await fetch(
    "https://driveactivity.googleapis.com/v2/activity:query",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        itemName: `items/${fileId}`,
        consolidationStrategy: { none: {} } 
      }),
    }
  );
  if (!activityRes.ok) {
    console.error(`[fetchReviewerTimestamps] Activity API failed: ${activityRes.status}`);
    return {};
  }
  const activityData = await activityRes.json();
  const activities = activityData.activities || [];
  console.log(`[fetchReviewerTimestamps] Found ${activities.length} total activities`);

  // 2. Filter approval events: both primaryActionDetail and all action details are empty {}
  const approvalEvents = activities.filter((a: any) => {
    const emptyPrimary =
      a.primaryActionDetail &&
      Object.keys(a.primaryActionDetail).length === 0;
    const emptyDetails =
      a.actions?.length > 0 &&
      a.actions.every(
        (act: any) => act.detail && Object.keys(act.detail).length === 0
      );
    return emptyPrimary && emptyDetails;
  });

  console.log(`[fetchReviewerTimestamps] Found ${approvalEvents.length} approval-like events`);

  if (approvalEvents.length === 0) return {};

  // 3. Collect unique personName IDs from all approval actions
  const personNamesSet = new Set<string>();
  for (const event of approvalEvents) {
    // Check top-level actors
    for (const actor of event.actors || []) {
      const personName = actor.user?.knownUser?.personName;
      if (personName) personNamesSet.add(personName);
    }
    // Check individual actions
    for (const action of event.actions || []) {
      const personName = action.actor?.user?.knownUser?.personName;
      if (personName) personNamesSet.add(personName);
    }
  }
  const personNames = Array.from(personNamesSet);
  console.log(`[fetchReviewerTimestamps] Resolving ${personNames.length} personNames via People API`);

  if (personNames.length === 0) return {};

  // 4. Batch resolve personNames -> emailAddresses via People API
  const params = new URLSearchParams();
  params.append("personFields", "emailAddresses");
  params.append("sources", "READ_SOURCE_TYPE_PROFILE");
  personNames.forEach((name) => params.append("resourceNames", name));

  const peopleRes = await fetch(
    `https://people.googleapis.com/v1/people:batchGet?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!peopleRes.ok) {
    console.error(`[fetchReviewerTimestamps] People API failed: ${peopleRes.status}`);
    return {};
  }
  const peopleData = await peopleRes.json();

  const personNameToEmail: Record<string, string> = {};
  for (const entry of peopleData.responses || []) {
    const email = entry.person?.emailAddresses?.[0]?.value;
    if (entry.requestedResourceName && email) {
      personNameToEmail[entry.requestedResourceName] = email.toLowerCase();
    }
  }

  // 5. Build email -> latest approval event timestamp
  // We take the LATEST one because a user might have multiple actions, 
  // and the "Approved" action usually comes after "viewed" or "modified" 
  // (though approvals appear as empty details).
  const emailToTimestamp: Record<string, string> = {};
  for (const event of approvalEvents) {
    const eventTimestamp = event.timestamp || event.timeRange?.endTime;
    if (!eventTimestamp) continue;

    // Use a set of emails associated with this specific event
    const emailsInEvent = new Set<string>();
    
    // Collect from event actors
    for (const actor of event.actors || []) {
      const pn = actor.user?.knownUser?.personName;
      if (pn && personNameToEmail[pn]) emailsInEvent.add(personNameToEmail[pn]);
    }
    // Collect from action actors
    for (const action of event.actions || []) {
      const pn = action.actor?.user?.knownUser?.personName;
      if (pn && personNameToEmail[pn]) emailsInEvent.add(personNameToEmail[pn]);
    }

    for (const email of emailsInEvent) {
      // If we have multiple events for the same email, we want the one 
      // closest to the approval status change. 
      // Usually, the earliest "empty" event after the approval was requested is the one.
      // However, if we take the latest, it might be the "Completion" event.
      // Let's stick to the earliest for now as per the spec, but keep an eye on it.
      if (!emailToTimestamp[email] || eventTimestamp < emailToTimestamp[email]) {
        emailToTimestamp[email] = eventTimestamp;
      }
    }
  }

  console.log(`[fetchReviewerTimestamps] Resulting map keys: ${Object.keys(emailToTimestamp).join(", ")}`);
  return emailToTimestamp;
}
