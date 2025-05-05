import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  parentId: z.string().cuid("invalid id").optional(),
});
export type CreateFolderDataForm = z.infer<typeof createFolderSchema>;
