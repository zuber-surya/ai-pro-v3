import { z } from "zod";
import { propertyCreateSchema } from "./property.validators.js";

export const bulkValidateRequestSchema = z.object({
  records: z.array(z.record(z.unknown())).min(1).max(5000),
  fileName: z.string().max(300).optional(),
  idempotencyKey: z.string().max(100).optional(),
});

export type BulkValidateRequest = z.infer<typeof bulkValidateRequestSchema>;

/** Normalize CSV/JSON aliases into propertyCreateSchema shape. */
export function normalizeBulkRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== null && raw[k] !== "") return raw[k];
      const found = Object.keys(raw).find((rk) => rk.toLowerCase() === k.toLowerCase());
      if (found && raw[found] !== undefined && raw[found] !== null && raw[found] !== "") {
        return raw[found];
      }
    }
    return undefined;
  };

  const statusRaw = get("status");
  const status =
    typeof statusRaw === "string" ? statusRaw.trim().toLowerCase() : statusRaw;

  const featuredRaw = get("featured");
  let featured: boolean | undefined;
  if (typeof featuredRaw === "boolean") featured = featuredRaw;
  else if (typeof featuredRaw === "string") {
    const v = featuredRaw.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") featured = true;
    if (v === "false" || v === "0" || v === "no") featured = false;
  }

  return {
    title: get("title"),
    description: get("description"),
    status: status === "draft" || status === "published" ? status : status ?? undefined,
    price: get("price", "priceAmount", "price_amount"),
    propertyType: get("propertyType", "property_type", "type"),
    bedrooms: get("bedrooms", "beds"),
    bathrooms: get("bathrooms", "baths"),
    areaSqFt: get("areaSqFt", "area_sq_ft", "sqft", "sqFt"),
    addressLine: get("addressLine", "address_line", "address"),
    city: get("city"),
    region: get("region", "state"),
    postalCode: get("postalCode", "postal_code", "zip"),
    country: get("country"),
    agentId: get("agentId", "agent_id"),
    featured,
    lat: get("lat", "latitude"),
    lng: get("lng", "longitude"),
  };
}

export const bulkRowCreateSchema = propertyCreateSchema.extend({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export type BulkRowCreateInput = z.infer<typeof bulkRowCreateSchema>;
