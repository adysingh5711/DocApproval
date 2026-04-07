import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";

const authOptions: NextAuthOptions = {
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
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.tokenExpiry = account.expires_at ? account.expires_at * 1000 : undefined;
        
        // at this point we would also need to save to convex.
        // we can do an api call to a specific convex endpoint or just perform it directly
        // via the generic next.js fetch. Since we can't easily run ConvexClient here synchronously
        // inside the edge-friendly NextAuth callback without `convex` node client setup:
        const convexUrl = env.NEXT_PUBLIC_CONVEX_URL;
        if (convexUrl) {
          // We can use the Convex HTTP API or fetch a mutation
          // Instead, since NextAuth calls this server-side, it's safe to use Node's fetch
          // Wait, sending it to Convex here might require Convex Node Library.
          // Let's rely on standard Convex fetch API or do it in the `signIn` callback
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      (session as any).accessToken = token.accessToken;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account && account.provider === "google") {
        const convexUrl = env.NEXT_PUBLIC_CONVEX_URL.replace("https://", "https://");
        if (convexUrl) {
          try {
            // We can't easily use the generated client here directly if we don't have it imported.
            // But we can just return true. We'll store it properly via HTTP action or just Convex actions.
            // A more robust way is to use `ConvexHttpClient`
            const { ConvexHttpClient } = require("convex/browser");
            const { api } = require("../../../../../convex/_generated/api");
            
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
      }
      return true;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
