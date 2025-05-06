import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  parentId: z.string().cuid("invalid id").optional().nullable(),
});
export const patchFolderSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  parentId: z.string().cuid("invalid id").optional().nullable(),
  isStarred: z.boolean().optional(),
});
export type CreateFolderDataForm = z.infer<typeof createFolderSchema>;
export type PatchFolderDataForm = z.infer<typeof patchFolderSchema>;
