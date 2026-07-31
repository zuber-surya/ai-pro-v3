import { z } from "zod";

export const PROPERTY_STATUSES = [
  "draft",
  "published",
  "archived",
  "sold",
  "rented",
] as const;

export const listPropertiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(PROPERTY_STATUSES).optional(),
  q: z.string().max(200).optional(),
  sortBy: z.enum(["createdAt", "price", "title", "status", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const propertyCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  price: z.union([z.string(), z.number()]).transform(String),
  propertyType: z.string().min(1).max(80),
  bedrooms: z.coerce.number().int().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(0),
  areaSqFt: z.coerce.number().min(0).default(0),
  addressLine: z.string().min(1).max(500),
  city: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  postalCode: z.string().max(32).optional(),
  country: z.string().max(120).optional(),
  agentId: z.string().uuid().optional(),
  featured: z.boolean().optional(),
});

export const propertyUpdateSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(10000).nullable().optional(),
    status: z.enum(PROPERTY_STATUSES).optional(),
    price: z.union([z.string(), z.number()]).transform(String).optional(),
    propertyType: z.string().min(1).max(80).optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().min(0).optional(),
    areaSqFt: z.coerce.number().min(0).optional(),
    addressLine: z.string().min(1).max(500).optional(),
    city: z.string().max(120).nullable().optional(),
    region: z.string().max(120).nullable().optional(),
    postalCode: z.string().max(32).nullable().optional(),
    country: z.string().max(120).nullable().optional(),
    featured: z.boolean().optional(),
    agentId: z.string().uuid().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field required" });

export const amenitiesUpdateSchema = z.object({
  amenities: z.array(z.string().min(1).max(120)).max(100),
});

export const propertyStatusPatchSchema = z.object({
  status: z.enum(PROPERTY_STATUSES),
});

export const bulkPropertyStatusSchema = z.object({
  propertyIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(PROPERTY_STATUSES),
});

export const exportPropertiesQuerySchema = listPropertiesQuerySchema
  .omit({ page: true, pageSize: true })
  .extend({
    format: z.enum(["csv", "json"]).default("csv"),
    limit: z.coerce.number().int().min(1).max(5000).default(1000),
  });

export const similarPropertiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(6),
});

export type ListPropertiesQuery = z.infer<typeof listPropertiesQuerySchema>;
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
export type AmenitiesUpdateInput = z.infer<typeof amenitiesUpdateSchema>;
export type BulkPropertyStatusInput = z.infer<typeof bulkPropertyStatusSchema>;
export type ExportPropertiesQuery = z.infer<typeof exportPropertiesQuerySchema>;
export type SimilarPropertiesQuery = z.infer<typeof similarPropertiesQuerySchema>;

/** Standard amenity names — others are treated as custom */
export const STANDARD_AMENITIES = [
  "Parking",
  "Balcony",
  "Gym",
  "Pool",
  "Garden",
  "Security",
  "Elevator",
  "Power Backup",
  "Clubhouse",
  "Pet Friendly",
] as const;
