import authOptions from "@/auth/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

/**
 * Check if user is authenticated in server components
 * Use this in server components to protect routes and get the current user
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return session.user;
}
