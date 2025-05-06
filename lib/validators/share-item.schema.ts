import { z } from "zod";

export const shareFileSchema = z
  .object({
    fileId: z.string().cuid("invalid file id").optional(),
    folderId: z.string().cuid("invalid folder id").optional(),
    sharedWithEmail: z.string().email(),
    permission: z.enum(["view", "edit", "admin"], {
      required_error: "Permission is required",
      invalid_type_error: "Permission must be one of 'view', 'edit', or 'admin'",
    }),
  })
  .refine((data) => data.fileId || data.folderId, {
    message: "Either fileId or folderId must be provided.",
    path: ["fileId"], //["folderId"]
  });
export const patchShareFileSchema = z
  .object({
    fileId: z.string().cuid("invalid file id").optional().nullable(),
    folderId: z.string().cuid("invalid folder id").optional().nullable(),
  })
  .refine(
    (data) => {
      return data.fileId || data.folderId;
    },
    {
      message: "Either fileId or folderId must be provided.",
      path: ["fileId"], //["folderId"]
    }
  );
export const shareFileInvitationSchema = z.object({
  token: z.string().uuid("invalid file id"),
});

export type ShareFileDataForm = z.infer<typeof shareFileSchema>;
export type PatchShareFileDataForm = z.infer<typeof patchShareFileSchema>;
