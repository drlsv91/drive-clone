import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type SharePerson = {
  id: string;
  sharedWithEmail: string;
  permission: string;
  createdAt: string;
  created: boolean;
};

/**
 * Custom hook for managing shares for files and folders
 */
export const useShares = (itemType: "file" | "folder", itemId: string, itemName: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryParam = itemType === "file" ? "fileId" : "folderId";

  const {
    data: shares = [],
    isLoading: isLoadingShares,
    error,
    refetch: fetchShares,
  } = useQuery<SharePerson[]>({
    queryKey: ["shares", itemType, itemId],
    queryFn: async () => {
      return axios.get(`/api/share?${queryParam}=${itemId}`).then((res) => res.data);
    },
    staleTime: 60 * 1000, // 60s
    retry: 3,
    enabled: !!itemId, // Only run if itemId exists
  });

  const shareItem = async (email: string, permission: string) => {
    if (!email) {
      toast.error("Email is required");
      return null;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/share", {
        [queryParam]: itemId,
        sharedWithEmail: email,
        permission,
      });

      await fetchShares();

      toast.success("Shared successfully", {
        description: `${itemName} has been shared with ${email}`,
      });

      return response.data;
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to share", {
        description: error.response?.data?.error ?? "An error occurred",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermission = async (shareId: string, newPermission: string) => {
    try {
      setIsLoading(true);
      await axios.put(`/api/share/${shareId}`, {
        permission: newPermission,
      });

      await fetchShares();

      toast.success("Permission updated");
    } catch (error: any) {
      toast.error("Failed to update permission", {
        description: error.response?.data?.error ?? "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeShare = async (shareId: string, email: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/share/${shareId}`);

      await fetchShares();

      toast.success("Share removed", {
        description: `${itemName} is no longer shared with ${email}`,
      });
    } catch (error: any) {
      toast.error("Failed to remove share", {
        description: error.response?.data?.error ?? "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shares,
    isLoading: isLoading || isLoadingShares,
    error,
    fetchShares,
    shareItem,
    updatePermission,
    removeShare,
  };
};

export type { SharePerson };
