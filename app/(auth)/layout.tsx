import React, { PropsWithChildren } from "react";
import HomeHeader from "../Header";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <HomeHeader />
      <main className="bg-slate-50 py-5 min-h-screen">{children}</main>
    </>
  );
};

export default AuthLayout;
