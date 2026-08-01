import { z } from "zod";

export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "negotiation",
  "won",
  "lost",
] as const;

export const leadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(40).optional(),
  preferredContactTime: z.string().max(120).optional(),
  message: z.string().max(5000).optional(),
  source: z.string().min(1).max(80).default("property_inquire"),
  propertyId: z.string().uuid(),
});

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  stage: z.enum(LEAD_STAGES).optional(),
  propertyId: z.string().uuid().optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
