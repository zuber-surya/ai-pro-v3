import { z } from "zod";

export const visitCreateSchema = z.object({
  propertyId: z.string().uuid(),
  scheduledAt: z
    .string()
    .min(1)
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date-time" }),
  notes: z.string().max(5000).optional(),
  leadId: z.string().uuid().optional(),
});

export type VisitCreateInput = z.infer<typeof visitCreateSchema>;
