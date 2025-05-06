import { formatBytes } from "@/lib/utils";

import { Plus, HardDrive, Users, Star, Clock, Trash, CloudOff } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { useStorage } from "@/hooks/useStorage";

const MobileNav = ({ onClose }: { onClose: () => void }) => {
  const {
    usage,
    usagePercentage,
    fetchUsage,
    ui: { isActive },
  } = useStorage();

  useEffect(() => {
    fetchUsage();
  }, []);
  return (
    <div className="flex flex-col flex-1 p-4 space-y-6">
      <div className="space-y-2">
        <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-base font-medium" asChild>
          <Link href="/dashboard/new">
            <Plus className="h-5 w-5" /> New
          </Link>
        </Button>
      </div>

      <nav className="space-y-1 flex-1">
        <Button onClick={onClose} size="sm" className="w-full justify-start gap-2 text-base font-medium" asChild>
          <Link href="/dashboard">
            <HardDrive className="h-5 w-5" /> My Drive
          </Link>
        </Button>

        <Button
          onClick={onClose}
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
          onClick={onClose}
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
          onClick={onClose}
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
          onClick={onClose}
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
          onClick={onClose}
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
  );
};

export default MobileNav;
