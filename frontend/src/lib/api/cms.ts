import { apiRequest } from "./client";

export type CmsPageStatus = "draft" | "published";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  body: string;
  sections: Record<string, unknown>;
  status: CmsPageStatus;
  publishedAt: string | null;
  updatedAt?: string;
};

export type CmsPagesListResponse = {
  data: CmsPage[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CmsPageCreate = {
  slug: string;
  title: string;
  body?: string;
  sections?: Record<string, unknown>;
  status?: CmsPageStatus;
};

export type CmsPageUpdate = {
  title?: string;
  body?: string;
  sections?: Record<string, unknown>;
  status?: CmsPageStatus;
};

export function getCmsHomepage() {
  return apiRequest<CmsPage>("/cms/homepage");
}

export function getPublishedPage(slug: string) {
  return apiRequest<CmsPage>(`/pages/${encodeURIComponent(slug)}`);
}

export function listCmsPages(params?: { page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiRequest<CmsPagesListResponse>(`/cms/pages${q ? `?${q}` : ""}`);
}

export function getCmsPage(id: string) {
  return apiRequest<CmsPage>(`/cms/pages/${id}`);
}

export function createCmsPage(payload: CmsPageCreate) {
  return apiRequest<CmsPage>("/cms/pages", { method: "POST", body: payload });
}

export function updateCmsPage(id: string, payload: CmsPageUpdate) {
  return apiRequest<CmsPage>(`/cms/pages/${id}`, { method: "PATCH", body: payload });
}

export function deleteCmsPage(id: string) {
  return apiRequest<void>(`/cms/pages/${id}`, { method: "DELETE" });
}
