import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          return true; // Let the OAuth flow complete first
        }

        // For credential provider
        if (account?.provider === "credentials") {
          // User should already exist, check for root folder
          const rootFolder = await prisma.folder.findFirst({
            where: {
              userId: user.id,
              isRoot: true,
            },
          });

          if (!rootFolder) {
            await prisma.folder.create({
              data: {
                name: "Root",
                isRoot: true,
                userId: user.id,
              },
            });
            console.log(`Created root folder for credentials user ${user.id}`);
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  events: {
    // Create root folder after a user is created
    async createUser(message) {
      try {
        const { user } = message;
        console.log(`Creating root folder for new user ${user.id}`);

        await prisma.folder.create({
          data: {
            name: "Root",
            isRoot: true,
            userId: user.id,
          },
        });
      } catch (error) {
        console.error("Error creating root folder for new user:", error);
      }
    },

    async signIn(message) {
      try {
        const { user, account } = message;

        if (account?.provider === "google") {
          const rootFolder = await prisma.folder.findFirst({
            where: {
              userId: user.id,
              isRoot: true,
            },
          });

          if (!rootFolder) {
            await prisma.folder.create({
              data: {
                name: "Root",
                isRoot: true,
                userId: user.id,
              },
            });
            console.log(`Created root folder for user ${user.id} during sign-in event`);
          }
        }
      } catch (error) {
        console.error("Error in signIn event handler:", error);
      }
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
