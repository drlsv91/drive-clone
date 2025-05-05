"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { Clock, CloudOff, HardDrive, Plus, Star, Trash, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [usage] = useState({
    used: 0,
    total: 100 * 1024 * 1024, // 100MB for demo
  });

  const usagePercentage = Math.min(Math.round((usage.used / usage.total) * 100), 100);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen pt-16 fixed left-0 top-0 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-1 p-4 space-y-6">
        <div className="space-y-2">
          <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-base font-medium" asChild>
            <Link href="/dashboard/new">
              <Plus className="h-5 w-5" /> New
            </Link>
          </Button>
        </div>

        <nav className="space-y-1 flex-1">
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2 text-base font-medium"
            asChild
          >
            <Link href="/dashboard">
              <HardDrive className="h-5 w-5" /> My Drive
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/shared") ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2 text-base font-medium"
            asChild
          >
            <Link href="/dashboard/shared">
              <Users className="h-5 w-5" /> Shared with me
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/starred") ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2 text-base font-medium"
            asChild
          >
            <Link href="/dashboard/starred">
              <Star className="h-5 w-5" /> Starred
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/recent") ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2 text-base font-medium"
            asChild
          >
            <Link href="/dashboard/recent">
              <Clock className="h-5 w-5" /> Recent
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/trash") ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2 text-base font-medium"
            asChild
          >
            <Link href="/dashboard/trash">
              <Trash className="h-5 w-5" /> Trash
            </Link>
          </Button>

          <Button
            variant={isActive("/dashboard/offline") ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2 text-base font-medium"
            asChild
          >
            <Link href="/dashboard/offline">
              <CloudOff className="h-5 w-5" /> Offline
            </Link>
          </Button>
        </nav>

        <div className="py-2 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Storage</span>
            <span>
              {formatBytes(usage.used)} of {formatBytes(usage.total)}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <Button variant="outline" size="sm" className="w-full">
            Buy storage
          </Button>
        </div>
      </div>
    </aside>
  );
}
