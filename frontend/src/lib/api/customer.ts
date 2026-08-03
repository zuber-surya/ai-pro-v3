import { apiRequest } from "./client";
import type { Property } from "./properties";

export type CustomerDashboard = {
  favoritesCount: number;
  inquiriesCount: number;
  savedSearchesCount: number;
  recentProperties: Property[];
  welcomeName?: string;
};

export type CustomerProfilePreferences = {
  budgetMin: string | null;
  budgetMax: string | null;
  propertyTypes: string[];
  bedsMin: number | null;
  locations: string[];
  completionPct: number;
};

export type CustomerProfile = {
  fullName: string;
  email: string;
  phone: string | null;
  preferences: CustomerProfilePreferences;
};

export type CustomerInquiry = {
  id: string;
  propertyId: string | null;
  propertyTitle: string | null;
  property?: Property | null;
  status: string;
  stage?: string;
  message: string | null;
  source?: string;
  createdAt: string;
};

export type PaginatedInquiries = {
  data: CustomerInquiry[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export function getCustomerDashboard() {
  return apiRequest<CustomerDashboard>("/customer/dashboard");
}

export function getCustomerProfile() {
  return apiRequest<CustomerProfile>("/customer/profile");
}

export function updateCustomerProfile(payload: {
  fullName?: string;
  phone?: string | null;
  preferences?: {
    budgetMin?: string | number | null;
    budgetMax?: string | number | null;
    propertyTypes?: string[];
    bedsMin?: number | null;
    locations?: string[];
  };
}) {
  return apiRequest<CustomerProfile>("/customer/profile", {
    method: "PUT",
    body: payload,
  });
}

export function listCustomerInquiries(params?: { page?: number; pageSize?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const s = q.toString();
  return apiRequest<PaginatedInquiries>(`/customer/inquiries${s ? `?${s}` : ""}`);
}
