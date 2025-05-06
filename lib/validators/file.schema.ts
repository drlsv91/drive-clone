import { z } from "zod";

export const fileFilterSchema = z.object({
  folderId: z.string().cuid("invalid id").optional(),
});
export const filePatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isStarred: z.boolean().optional(),
  operation: z.enum(["star", "unstar", "restore"]).optional(),
});
export type FileFilterDataForm = z.infer<typeof fileFilterSchema>;
export type FilePatchDataForm = z.infer<typeof filePatchSchema>;
