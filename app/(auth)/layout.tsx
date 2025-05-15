"use client";
import React, { PropsWithChildren } from "react";
import HomeHeader from "../Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }: PropsWithChildren) => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/dashboard");
  }

  return (
    <>
      <HomeHeader />
      <main className="bg-slate-50 py-5 min-h-screen">{children}</main>
    </>
  );
};

export default AuthLayout;
