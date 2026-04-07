# DocApproval Portal — Technical Specification

## Overview

DocApproval Portal is a Next.js web application that allows authenticated users to analyse Google Drive document approval workflows, track reviewer responses, send reminders via Gmail, and manage a personal library of monitored documents — all backed by a single Google OAuth 2.0 token and Convex as the free real-time backend.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, SSR + API routes in one repo |
| Auth | Google OAuth 2.0 (next-auth) | Reuses token for Drive + Gmail API calls |
| Backend / DB | Convex | Free tier, real-time subscriptions, built-in scheduled jobs |
| Styling | Tailwind CSS v4 | Utility-first, pairs natively with Next.js |
| Email | Gmail API (same OAuth token) | No SMTP setup; sends as the logged-in user |
| Fuzzy Search | Fuse.js (client-side) | Zero-cost, works with Convex live data |

---

## Google OAuth Scopes Required

The OAuth consent screen must request the following scopes at login time. All three are needed before the token is issued — no incremental auth.

```
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/drive.metadata.readonly
```

The `drive.metadata.readonly` scope enables fetching the document title via:

```
GET https://www.googleapis.com/drive/v3/files/{fileId}?fields=name
```

---

## Authentication Flow

1. User lands on `/login`.
2. Clicks **Sign in with Google** — triggers `signIn("google")` via NextAuth.
3. Google OAuth consent screen is shown with the three scopes listed above.
4. On grant, NextAuth stores the `access_token` and `refresh_token` in the Convex `users` table (server-side, never exposed to the browser directly).
5. The access token is passed to all subsequent Google API calls server-side via Next.js API routes.
6. NextAuth handles token refresh transparently using the `refresh_token`.
7. User can log out via `/api/auth/signout`, which clears the session and redirects to `/login`.

> **Important**: The token must be stored server-side. Never expose `access_token` in client-side state or browser storage.

---

## Application Routes

| Route | Description |
|---|---|
| `/login` | Google OAuth entry point |
| `/dashboard` | Document library — list, filter, search |
| `/analyse` | New document analysis form |
| `/analyse/[docId]` | Approval status results page for a specific doc |
| `/settings/categories` | Manage categories and subcategories |

All routes except `/login` are protected. Unauthenticated requests are redirected to `/login` via NextAuth middleware.

---

## Pages — Detailed Specification

### `/login`

- Single centered card with the app logo and a **Sign in with Google** button.
- On successful auth, redirect to `/dashboard`.
- Show an error banner if OAuth fails (scope denied, account error).

---

### `/analyse` — New Analysis Form

A form with the following fields, submitted to trigger the approval API call:

| Field | Type | Notes |
|---|---|---|
| Document Link | Text input | Full Google Docs URL |
| Category | Dropdown | Predefined + user-added options |
| Subcategory | Dropdown | Filtered by selected Category |
| + Add Category | Inline action | Appends only if no duplicate exists |
| + Add Subcategory | Inline action | Scoped to the current Category; no duplicates |

**File ID extraction logic** (run client-side before submission):

```
Input URL formats accepted:
  https://docs.google.com/document/d/{fileId}/edit?usp=sharing
  https://docs.google.com/document/d/{fileId}/edit?tab=t.0
  https://docs.google.com/document/d/{fileId}/

Regex: /\/document\/d\/([a-zA-Z0-9_-]+)/
Extracted fileId: first capture group
```

On clicking **Analyse**:
1. Extract `fileId` from the URL client-side.
2. POST to `/api/analyse` with `{ fileId, category, subcategory }`.
3. Show a loading spinner on the button.
4. On success, redirect to `/analyse/[docId]`.
5. On error (invalid URL, API error), show inline error message — do not navigate.

---

### `/analyse/[docId]` — Approval Status Page

This page displays the results of the Drive Approvals API call for the most recent approval request.

#### Header Strip

```
[ App Logo ]   [ Document Title (fetched via Drive metadata API) ]   [ Open Document ↗ ]   [ User Avatar + Logout ]
```

- **Open Document** opens the original Google Docs URL in a new tab (`target="_blank"`).
- Document title is fetched via `GET https://www.googleapis.com/drive/v3/files/{fileId}?fields=name` and displayed everywhere instead of the raw fileId.

#### Latest Approval Selection Logic

The API returns an array of approval items. The **latest** is determined by:

```
Sort items by createTime descending → take items[0]
```

If `items` is empty, show an empty state: _"No approval requests found for this document."_

#### Approval Summary Block

```
Approval ID:       [approvalId — shown truncated with a copy icon]
Created:           [createTime — formatted as "5 Dec 2025, 10:28 AM IST"]
Last Modified:     [modifyTime — formatted as "5 Dec 2025, 12:56 PM IST"]
Status:            [APPROVED | CANCELLED | DECLINED | PENDING — coloured badge]
```

Status badge colours:

| Status | Badge Colour |
|---|---|
| APPROVED | Green |
| PENDING | Amber |
| DECLINED | Red |
| CANCELLED | Grey |

#### Reviewers Table

| Name | Email | Response | Action |
|---|---|---|---|
| karl | karl@atlasconsolidated.com | NO_RESPONSE | Send Reminder |
| namisha | namisha@hugohub.com | APPROVED | — |
| braham | braham@atlasconsolidated.com | DECLINED | — |

- **Send Reminder** button is enabled only when `response === "NO_RESPONSE"`.
- Clicking it opens the **Email Customisation Modal** pre-populated with that reviewer's email.
- Response values are displayed as coloured chips: `APPROVED` (green), `DECLINED` (red), `NO_RESPONSE` (muted grey).

#### Bottom Action Bar

```
[ Send Reminder to All ]    [ Turn on Tracking ]
```

- **Send Reminder to All**: filters `reviewerResponses` where `response === "NO_RESPONSE"`, sends one email per reviewer via the Gmail API, using the customised email body. Disabled if no NO_RESPONSE reviewers exist.
- **Turn on Tracking**: opens the **Tracking Configuration Panel** (see below).

---

### Email Customisation Modal

Triggered by either **Send Reminder** (single) or **Send Reminder to All**.

| Field | Default Value | Editable |
|---|---|---|
| To | Reviewer email(s) pre-filled | Yes — can remove recipients |
| Subject | `Approval Reminder: {Document Title}` | Yes |
| Body | `Kindly review the document {Document Link} sent for approval and update the status accordingly.` | Yes |

- `{Document Link}` and `{Document Title}` are substituted at render time.
- The body is a plain `<textarea>` — no rich text editor needed.
- **Send** button calls `/api/send-reminder` with the final recipients and body.
- The email is sent **from the logged-in user's Gmail** using the stored OAuth token with `gmail.send` scope.

#### Gmail API Send Payload (server-side, `/api/send-reminder`)

```
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
Authorization: Bearer {access_token}

Body: RFC 2822 message encoded in Base64URL
  From: {logged-in user email}
  To: {recipient email}
  Subject: {subject}
  Content-Type: text/plain; charset=utf-8

  {body}
```

---

### Tracking Configuration Panel

A slide-in panel or modal triggered by **Turn on Tracking**.

| Field | Type | Options |
|---|---|---|
| Interval Value | Number input | Any positive integer |
| Interval Unit | Dropdown | Hours / Days / Weeks |
| Auto-stop on terminal status | Toggle | Default: ON |

- When enabled, Convex creates a scheduled job record in the `trackingJobs` table.
- The job queries the Drive Approvals API at the configured interval.
- If new `NO_RESPONSE` reviewers are found (or status unchanged), it automatically sends reminders using the same Gmail API flow.
- If **Auto-stop** is ON, the job cancels itself when the document reaches `APPROVED` or `DECLINED` status.
- The tracking state is shown in the header of `/analyse/[docId]` as a pill: `Tracking: Every 6 hours`.
- User can stop tracking from the same panel (button toggles to **Stop Tracking**).

---

### `/dashboard` — Document Library

All documents ever analysed by the logged-in user, stored in Convex and rendered as a filterable, searchable list.

#### Toolbar

```
[ Search box (fuzzy) ]   [ Category filter dropdown ]   [ Subcategory filter dropdown ]
```

- Fuzzy search is powered by **Fuse.js** on the client against the document title field.
- Search keys: `title`, `category`, `subcategory`.
- Category and Subcategory dropdowns cascade (selecting a category narrows subcategory options).
- "All Categories" / "All Subcategories" as the default empty-filter option.

#### Document List Item

Each entry displays:

```
[ Document Title ]                     [ Status Badge ]    [ Tracking Pill? ]
  Category > Subcategory               Last analysed: 6 Apr 2026
  [ View Analysis ]  [ Re-analyse ]  [ Remove ]
```

- **Title** is fetched from the Drive metadata API at analysis time and stored in Convex — never the raw fileId.
- **Re-analyse** re-calls the Drive Approvals API and refreshes the stored snapshot.
- **Remove** deletes the record from Convex (does not affect the Google Doc or approval).
- Clicking **View Analysis** navigates to `/analyse/[docId]`.

---

### `/settings/categories` — Category Management

A simple settings page to manage the taxonomy.

| Action | Behaviour |
|---|---|
| Add Category | Input + Add button. Saves only if the trimmed name does not already exist (case-insensitive comparison). Shows inline error "Category already exists" if duplicate. |
| Add Subcategory | Dropdown to select parent Category + input + Add button. Same no-duplicate check scoped within the parent Category. |
| Delete Category | Deletes category and all its subcategories. Confirmation modal before deletion. |
| Delete Subcategory | Removes only that subcategory. |

Pre-seeded categories (suggested defaults — editable):

- **Legal** → Contract, NDA, Policy
- **Finance** → Invoice, Budget, Report
- **Engineering** → RFC, ADR, Spec
- **Marketing** → Campaign Brief, Copy Review
- **HR** → Offer Letter, Performance Review

---

## Convex Data Schema

### `users`

| Field | Type | Notes |
|---|---|---|
| `_id` | Convex ID | Auto |
| `email` | string | From Google profile |
| `name` | string | Display name |
| `googleId` | string | Google sub claim |
| `accessToken` | string | Encrypted at rest |
| `refreshToken` | string | Encrypted at rest |
| `tokenExpiry` | number | Unix timestamp |

### `documents`

| Field | Type | Notes |
|---|---|---|
| `_id` | Convex ID | Auto |
| `userId` | Convex ID | Foreign key → users |
| `fileId` | string | Google Drive fileId |
| `title` | string | Fetched from Drive metadata |
| `docUrl` | string | Original Google Docs URL |
| `category` | string | |
| `subcategory` | string | |
| `lastAnalysedAt` | number | Unix timestamp |
| `latestApprovalSnapshot` | object | Full latest approval item JSON |

### `trackingJobs`

| Field | Type | Notes |
|---|---|---|
| `_id` | Convex ID | Auto |
| `userId` | Convex ID | |
| `documentId` | Convex ID | Foreign key → documents |
| `intervalValue` | number | e.g. 6 |
| `intervalUnit` | string | `"hours"` \| `"days"` \| `"weeks"` |
| `intervalMs` | number | Computed: value × unit in ms |
| `autoStop` | boolean | |
| `active` | boolean | |
| `lastRunAt` | number | Unix timestamp |
| `nextRunAt` | number | Unix timestamp |
| `convexJobId` | string | Convex scheduler job reference |

### `categories`

| Field | Type | Notes |
|---|---|---|
| `_id` | Convex ID | Auto |
| `userId` | Convex ID | Per-user taxonomy |
| `name` | string | Category name |
| `subcategories` | string[] | Array of subcategory names |

---

## API Routes (Next.js `/app/api/`)

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/analyse` | POST | Extract fileId, call Drive Approvals API, fetch title, store in Convex |
| `/api/send-reminder` | POST | Send Gmail API email from user's account |
| `/api/tracking/start` | POST | Create Convex scheduled job |
| `/api/tracking/stop` | POST | Cancel Convex scheduled job |
| `/api/categories` | GET/POST/DELETE | CRUD for user categories |

---

## Drive Approvals API

**Endpoint:**

```
GET https://www.googleapis.com/drive/v3/files/{fileId}/approvals
  ?fields=items(approvalId,status,createTime,modifyTime,reviewerResponses(reviewer(emailAddress,displayName),response))
Authorization: Bearer {access_token}
```

**Latest approval selection:**

```javascript
const latest = items.sort(
  (a, b) => new Date(b.createTime) - new Date(a.createTime)
)[0];
```

**Document title fetch:**

```
GET https://www.googleapis.com/drive/v3/files/{fileId}?fields=name
Authorization: Bearer {access_token}
```

---

## Tracking Job — Convex Scheduler

Convex's built-in `scheduler` is used instead of cron or a third-party job runner (free tier supports this).

```javascript
// convex/trackingJobs.ts

export const runTrackingJob = internalAction(async ({ runQuery, runMutation }, { documentId, userId }) => {
  const doc = await runQuery(internal.documents.get, { documentId });
  // 1. Call Drive Approvals API using user's stored access token
  // 2. Get latest approval
  // 3. Find NO_RESPONSE reviewers
  // 4. Send Gmail reminder to each
  // 5. Update lastAnalysedAt snapshot in documents table
  // 6. If autoStop && status in ['APPROVED', 'DECLINED'] → cancel job
  // 7. Otherwise → reschedule self at nextRunAt
});
```

Interval conversion:

```javascript
const unitMs = { hours: 3600000, days: 86400000, weeks: 604800000 };
const intervalMs = intervalValue * unitMs[intervalUnit];
```

---

## Environment Variables

```env
# .env.local

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

CONVEX_DEPLOYMENT=<from Convex dashboard>
NEXT_PUBLIC_CONVEX_URL=<from Convex dashboard>
```

---

## Google Cloud Console Setup

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable the following APIs:
   - Google Drive API
   - Gmail API
3. Create an OAuth 2.0 Client ID (Web application type).
4. Add authorised redirect URI: `http://localhost:3000/api/auth/callback/google` (and production domain equivalent).
5. Add the three scopes listed in the **Google OAuth Scopes Required** section to the OAuth consent screen.
6. Submit for verification if the app will have external users (required for `gmail.send` scope in production).

---

## Key UX Rules

- **Document title is shown everywhere** — the raw fileId or URL is never displayed to the user in any UI element.
- **Send Reminder button** is only clickable when `response === "NO_RESPONSE"` for that reviewer. It is visually disabled (greyed out, `cursor-not-allowed`) otherwise.
- **Send Reminder to All** is disabled if there are zero `NO_RESPONSE` reviewers in the latest approval.
- **Duplicate category/subcategory** entries are blocked with an inline error — no toast, no navigation.
- **Tracking state** is always visible on the analysis page header so the user knows at a glance whether auto-reminders are active.
- **Logout** clears the NextAuth session and redirects to `/login`. The Convex tokens are revoked server-side on logout.

---

## Out of Scope (v1)

- Multi-user / team workspaces — all data is per-user
- Approval creation (only reads existing approvals)
- Support for non-Google Drive documents
- Mobile native app
- Audit log / history of sent reminders
