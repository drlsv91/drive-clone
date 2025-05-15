import { PropsWithChildren } from "react";
import HomeHeader from "../Header";
import authOptions from "@/auth/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: PropsWithChildren) => {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <HomeHeader />
      <main className="bg-slate-50 py-5 min-h-screen">{children}</main>
    </>
  );
};

export default AuthLayout;
