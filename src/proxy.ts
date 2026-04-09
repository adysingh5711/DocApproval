import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    return NextResponse.next();
}

// Excludes from auth proxy:
//   /          → public landing page
//   /login     → auth entry point
//   /terms     → public legal
//   /privacy   → public legal
//   /_next      → Next.js internals
//   /favicon*  → favicon
//   /images/*  → public assets
export const config = {
    matcher: [
        "/((?!$|login|terms|privacy|_next/static|_next/image|favicon|images/).*)",
    ],
};