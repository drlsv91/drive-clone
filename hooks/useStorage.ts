import axios from "axios";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const useStorage = () => {
  const pathname = usePathname();
  const [usage, setUsage] = useState({
    used: 0,
    total: 100 * 1024 * 1024, // 100MB for demo
  });

  const { data: session } = useSession();

  const fetchUsage = async () => {
    if (session?.user?.id) {
      try {
        const response = await axios.get("/api/users/storage");

        setUsage({
          used: response.data.usedStorage,
          total: 100 * 1024 * 1024, // 100MB limit
        });
      } catch (error) {
        console.error("Error fetching storage usage:", error);
      }
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const usagePercentage = Math.min(Math.round((usage.used / usage.total) * 100), 100);

  return {
    usagePercentage,
    setUsage,
    usage,
    fetchUsage,
    ui: { isActive },
  };
};
