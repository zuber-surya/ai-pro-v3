import { z } from "zod";

export const listInquiriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const customerProfileUpdateSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().max(40).nullable().optional(),
  preferences: z
    .object({
      budgetMin: z.union([z.string(), z.number()]).nullable().optional(),
      budgetMax: z.union([z.string(), z.number()]).nullable().optional(),
      propertyTypes: z.array(z.string().max(80)).optional(),
      bedsMin: z.coerce.number().int().min(0).nullable().optional(),
      locations: z.array(z.string().max(120)).optional(),
    })
    .optional(),
});

export type ListInquiriesQuery = z.infer<typeof listInquiriesQuerySchema>;
export type CustomerProfileUpdateInput = z.infer<typeof customerProfileUpdateSchema>;
