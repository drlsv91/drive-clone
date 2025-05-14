"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useFiles() {
  const router = useRouter();

  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = async ({ name, id }: { name: string; id: string }) => {
    try {
      setIsRenaming(true);
      await axios.put(`/api/files/${id}`, { name });

      toast.success("File renamed", {
        description: `File has been renamed to ${name}.`,
      });

      router.refresh();
    } catch (error: any) {
      toast.error("Rename failed", {
        description: error.message ?? "Something went wrong.",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async ({ onDelete, id, name }: { onDelete?: () => void; id: string; name: string }) => {
    try {
      setIsDeleting(true);

      await axios.delete(`/api/files/${id}`);

      toast.success("File deleted", {
        description: `${name} has been deleted.`,
      });

      if (onDelete) {
        onDelete();
      }

      router.refresh();
    } catch (error: any) {
      toast.error("Delete failed", {
        description: error.message ?? "Something went wrong.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    actions: {
      isRenaming,
      setIsRenaming,
      isDeleting,
      setIsDeleting,
      renameFile: handleRename,
      deleteFile: handleDelete,
    },
  };
}
