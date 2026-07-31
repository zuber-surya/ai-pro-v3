import { z } from "zod";

export const propertyImageKindSchema = z.enum(["photo", "floorplan"]);

export const propertyImageUploadMetaSchema = z.object({
  kind: propertyImageKindSchema.default("photo"),
  caption: z.string().max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type PropertyImageUploadMeta = z.infer<typeof propertyImageUploadMetaSchema>;
