import Navbar from "@/components/layouts/Navbar";
import Sidebar from "@/components/layouts/Sidebar";
import React, { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-16 lg:pl-64">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </>
  );
}
