"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUp, FolderPlus, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CreateFolderDialog from "./CreateFolderDialog";
import FileUpload from "./FileUpload";

interface ActionButtonsProps {
  folderId?: string;
  onAction?: () => void;
}

export default function ActionButtons({ folderId, onAction }: Readonly<ActionButtonsProps>) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsCreateFolderDialogOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>Folder</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsUploadDialogOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              <span>File upload</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/upload" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                <span>Advanced Upload</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      <CreateFolderDialog
        open={isCreateFolderDialogOpen}
        onOpenChange={setIsCreateFolderDialogOpen}
        parentId={folderId}
        onSuccess={() => {
          if (onAction) onAction();
        }}
      />

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-semibold mb-4">Upload a file</DialogTitle>
          <FileUpload
            folderId={folderId}
            onUploadComplete={() => {
              setIsUploadDialogOpen(false);
              if (onAction) onAction();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
