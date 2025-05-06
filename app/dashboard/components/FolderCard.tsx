"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, FolderOpen, MoreVertical, Trash, Edit, Share, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import ShareDialog from "./ShareDialog";
import { formatDate } from "@/lib/utils";

interface FolderProps {
  id: string;
  name: string;
  isRoot?: boolean;
  isStarred?: boolean;
  createdAt: string;
  onDelete?: () => void;
}

export default function FolderCard({
  id,
  name,
  isRoot = false,
  isStarred = false,
  createdAt,
  onDelete,
}: Readonly<FolderProps>) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isShareFile, setIsShareFile] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();

  const handleRename = async () => {
    if (isRoot) return;

    try {
      await axios.put(`/api/folders/${id}`, { name: newName });

      toast.success("Folder renamed", {
        description: `Folder has been renamed to ${newName}.`,
      });

      setIsRenaming(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Rename failed", {
        description: error.response?.data?.error ?? "Something went wrong.",
      });
    }
  };

  const handleDelete = async () => {
    if (isRoot) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/folders/${id}`);

      toast.success("Folder deleted", {
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

  const handleToggleStar = async () => {
    try {
      await axios.patch(`/api/folders/${id}`, {
        operation: isStarred ? "unstar" : "star",
      });

      toast.info(isStarred ? "Folder unstarred" : "Folder starred", {
        description: `${name} has been ${isStarred ? "removed from" : "added to"} starred items.`,
      });

      router.refresh();
    } catch (error: any) {
      toast.error("Action failed", {
        description: error.message ?? "Something went wrong.",
      });
    }
  };

  return (
    <div
      className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <Link href={`/dashboard/${id}`} className="flex items-center gap-3 flex-1">
            <div className="bg-blue-100 rounded-lg p-2">
              {isHovered ? (
                <FolderOpen className="h-6 w-6 text-blue-600" />
              ) : (
                <Folder className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              {isRenaming ? (
                <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  />
                  <button onClick={handleRename} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(false);
                      setNewName(name);
                    }}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-medium">{name}</p>
                  {isStarred && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                </div>
              )}
              <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
            </div>
          </Link>

          {!isRoot && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStar}>
                  <Star className="mr-2 h-4 w-4" />
                  <span>{isStarred ? "Unstar" : "Star"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsShareFile(true)}>
                  <Share className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <ShareDialog open={isShareFile} onOpenChange={setIsShareFile} itemType="folder" itemId={id} itemName={name} />
    </div>
  );
}
