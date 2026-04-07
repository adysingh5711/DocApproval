import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

async function refreshGoogleToken(refreshToken: string): Promise<{
  accessToken: string;
  tokenExpiry: number;
  refreshToken: string;
} | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokens = await response.json();
    if (!response.ok) {
      console.error("Token refresh failed:", tokens);
      return null;
    }

    return {
      accessToken: tokens.access_token,
      tokenExpiry: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? refreshToken,
    };
  } catch (err) {
    console.error("Token refresh error:", err);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.activity https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/contacts.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On initial sign-in, store tokens from OAuth response
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.tokenExpiry = account.expires_at ? account.expires_at * 1000 : undefined;
        return token;
      }

      // If token is still valid (with 60s buffer), return as-is
      const expiry = token.tokenExpiry as number | undefined;
      if (expiry && Date.now() < expiry - 60_000) {
        return token;
      }

      // Token is expired or about to expire — refresh it
      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) {
        console.warn("No refresh token available — user must re-authenticate");
        return { ...token, error: "RefreshTokenMissing" };
      }

      const refreshed = await refreshGoogleToken(refreshToken);
      if (!refreshed) {
        return { ...token, error: "RefreshTokenError" };
      }

      console.log("Access token refreshed successfully");
      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        tokenExpiry: refreshed.tokenExpiry,
        error: undefined,
      };
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).tokenError = (token as any).error;
      return session;
    },
    async signIn({ user, account }) {
      if (account && account.provider === "google") {
        try {
          const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
          await client.mutation(api.users.upsertUserTokens, {
            email: user.email || "",
            name: user.name || "",
            googleId: user.id || "",
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiry: account.expires_at ? account.expires_at * 1000 : undefined,
          });
        } catch (e) {
          console.error("Failed to sync tokens to Convex", e);
        }
      }
      return true;
    }
  },
};
