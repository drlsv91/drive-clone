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

        // If user doesn't exist or doesn't have a password (e.g., OAuth-only users)
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
        if (!user?.id) {
          console.error("No user ID found during sign in");
          return false;
        }

        if (account?.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true },
          });

          if (existingUser) {
            // Check if root folder exists
            const rootFolder = await prisma.folder.findFirst({
              where: {
                userId: user.id,
                isRoot: true,
              },
            });

            // Create root folder if it doesn't exist
            if (!rootFolder) {
              await prisma.folder.create({
                data: {
                  name: "Root",
                  isRoot: true,
                  userId: user.id,
                },
              });
              console.log(`Created root folder for user ${user.id}`);
              return true;
            }

            // User exists and has a root folder
            return true;
          } else {
            // This should rarely happen as the adapter should create the user
            console.error(`User ${user.id} not found in database during OAuth sign in`);
            return false;
          }
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

          return true;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);

        return false;
      }
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
