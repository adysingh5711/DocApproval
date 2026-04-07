import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

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
          scope: "openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.metadata.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.tokenExpiry = account.expires_at ? account.expires_at * 1000 : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
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
