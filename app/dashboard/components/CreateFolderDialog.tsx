"use client";

import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError } from "@/lib/utils";
import { CreateFolderDataForm, createFolderSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  onSuccess?: () => void;
}

export default function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  onSuccess,
}: Readonly<CreateFolderDialogProps>) {
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFolderDataForm>({
    resolver: zodResolver(createFolderSchema),
  });

  const router = useRouter();

  const createFolder = async (data: CreateFolderDataForm) => {
    try {
      setIsCreating(true);
      await axios.post("/api/folders", {
        name: data.name,
        parentId: parentId ?? null,
      });
      reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (error: unknown) {
      showError(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new folder</DialogTitle>
          <DialogDescription>Enter a name for your new folder.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="folderName">Folder name</Label>
          <Input
            id="folderName"
            placeholder="My Folder"
            className={clsx("mt-2", { "border border-red-500": !!errors?.name })}
            {...register("name")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(createFolder)()}
          />
          <ErrorMessage>{errors?.name?.message}</ErrorMessage>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(createFolder)} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
