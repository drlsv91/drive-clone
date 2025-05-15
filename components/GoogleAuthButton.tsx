"use client";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const GoogleAuthButton: React.FC<{ label: string }> = ({ label }) => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  return (
    <Button
      variant="outline"
      className="w-full h-12 flex items-center gap-2 cursor-pointer"
      onClick={() => signIn("google", { callbackUrl })}
    >
      <Image src="/google-logo.png" alt="Google Logo" width={20} height={20} />
      <span>{label}</span>
    </Button>
  );
};

export default GoogleAuthButton;
