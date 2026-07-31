import { apiRequest } from "./client";
import { publicEnv } from "@/lib/config/env";
import { getAccessToken } from "@/lib/auth";
import { AppError, type ApiErrorEnvelope } from "@/types/api";

export type PropertyStatus = "draft" | "published" | "archived" | "sold" | "rented";

export type Property = {
  id: string;
  title: string;
  description: string | null;
  status: PropertyStatus;
  price: string;
  currency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  address: {
    line: string;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
  };
  amenities: string[];
  featured: boolean;
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PaginatedProperties = {
  data: Property[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ListPropertiesParams = {
  page?: number;
  pageSize?: number;
  status?: PropertyStatus;
  q?: string;
  sortBy?: "createdAt" | "price" | "title" | "status" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type PropertyCreatePayload = {
  title: string;
  price: string;
  propertyType: string;
  addressLine: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  status?: PropertyStatus;
  description?: string;
  featured?: boolean;
};

export type PropertyUpdatePayload = {
  title?: string;
  description?: string | null;
  price?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  addressLine?: string;
  city?: string | null;
  featured?: boolean;
  status?: PropertyStatus;
};

function toQuery(params?: ListPropertiesParams & { format?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listProperties(params?: ListPropertiesParams) {
  return apiRequest<PaginatedProperties>(`/properties${toQuery(params)}`);
}

export function getProperty(id: string) {
  return apiRequest<Property>(`/properties/${id}`);
}

export function createProperty(payload: PropertyCreatePayload) {
  return apiRequest<Property>("/properties", { method: "POST", body: payload });
}

export function updateProperty(id: string, payload: PropertyUpdatePayload) {
  return apiRequest<Property>(`/properties/${id}`, { method: "PATCH", body: payload });
}

export function replaceAmenities(id: string, amenities: string[]) {
  return apiRequest<Property>(`/properties/${id}/amenities`, {
    method: "PUT",
    body: { amenities },
  });
}

export function updatePropertyStatus(id: string, status: PropertyStatus) {
  return apiRequest<Property>(`/properties/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function archiveProperty(id: string) {
  return apiRequest<Property>(`/properties/${id}/archive`, { method: "POST" });
}

export function duplicateProperty(id: string) {
  return apiRequest<Property>(`/properties/${id}/duplicate`, { method: "POST" });
}

export function deleteProperty(id: string) {
  return apiRequest<void>(`/properties/${id}`, { method: "DELETE" });
}

export function bulkUpdatePropertyStatus(propertyIds: string[], status: PropertyStatus) {
  return apiRequest<{ message: string; count: number }>("/properties/bulk/status", {
    method: "POST",
    body: { propertyIds, status },
  });
}

export async function exportPropertiesCsv(params?: ListPropertiesParams): Promise<Blob> {
  const token = getAccessToken();
  const res = await fetch(
    `${publicEnv.apiBaseUrl}/properties/export${toQuery({ ...params, format: "csv" })}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!res.ok) {
    let code = "INTERNAL_ERROR";
    let message = res.statusText;
    let details: AppError["details"] = [];
    try {
      const data = (await res.json()) as ApiErrorEnvelope;
      code = data.error?.code ?? code;
      message = data.error?.message ?? message;
      details = data.error?.details ?? [];
    } catch {
      /* ignore */
    }
    throw new AppError(code, message, res.status, details);
  }
  return res.blob();
}
