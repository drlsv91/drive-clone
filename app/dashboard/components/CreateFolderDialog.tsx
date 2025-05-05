"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFolderDataForm, createFolderSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import ErrorMessage from "@/components/ErrorMessage";
import clsx from "clsx";

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
    } catch (error: any) {
      toast.error("Creation failed", {
        description: error.response?.data?.error ?? "Something went wrong.",
      });
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
