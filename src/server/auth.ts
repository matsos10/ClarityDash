import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { CALENDAR_SCOPE } from "./google";
import { ensureUserSpaces } from "./spaces";

export function allowedEmails(): string[] {
  return [process.env.MATIAS_EMAIL, process.env.ANA_EMAIL]
    .filter((e): e is string => !!e)
    .map((e) => e.trim().toLowerCase());
}

const devLogin = process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 90 },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // e-mails vérifiés par Google et limités à la liste autorisée
      allowDangerousEmailAccountLinking: true,
      // Google Agenda : lecture de l'agenda + création des blocs (timeboxing)
      authorization: {
        params: { scope: `openid email profile ${CALENDAR_SCOPE}`, access_type: "offline", prompt: "consent" },
      },
    }),
    ...(devLogin
      ? [
          CredentialsProvider({
            id: "dev",
            name: "Dev",
            credentials: { email: { label: "E-mail", type: "email" } },
            async authorize(creds) {
              const email = creds?.email?.trim().toLowerCase();
              if (!email || !allowedEmails().includes(email)) return null;
              return db.user.upsert({ where: { email }, update: {}, create: { email, name: email.split("@")[0] } });
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      return !!email && allowedEmails().includes(email);
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      await ensureUserSpaces(db, user);
      // l'adaptateur ne met pas à jour les jetons d'un compte déjà lié
      if (account?.provider === "google" && account.access_token) {
        await db.account.updateMany({
          where: { provider: "google", providerAccountId: account.providerAccountId },
          data: {
            access_token: account.access_token,
            expires_at: account.expires_at,
            scope: account.scope,
            id_token: account.id_token,
            ...(account.refresh_token ? { refresh_token: account.refresh_token } : {}),
          },
        });
      }
    },
  },
};
