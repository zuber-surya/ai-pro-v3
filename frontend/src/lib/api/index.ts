export { apiRequest, ApiError, AppError, configureApiAuth } from "./client";
export { getHealth } from "./health";
export { register, login, refresh, logout, getMe } from "./auth";
export type { RegisterPayload, LoginPayload } from "./auth";
export { listUsers, createUser, updateUser, getUser } from "./users";
export type { PaginatedUsers, UserCreatePayload, UserUpdatePayload } from "./users";
export {
  listAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  uploadAgentImage,
  agentImageSrc,
} from "./agents";
export type { Agent, PaginatedAgents, AgentCreatePayload, AgentUpdatePayload } from "./agents";
export {
  listProperties,
  getProperty,
  getSimilarProperties,
  getFeaturedProperties,
  propertyMediaSrc,
  createProperty,
  updateProperty,
  replaceAmenities,
  replaceLandmarks,
  updatePropertyStatus,
  archiveProperty,
  duplicateProperty,
  deleteProperty,
  bulkUpdatePropertyStatus,
  exportPropertiesCsv,
  listPropertyImages,
  uploadPropertyImage,
  deletePropertyImage,
} from "./properties";
export type {
  Property,
  PropertyDetail,
  PropertyAgent,
  PropertyLandmark,
  PropertyStatus,
  PaginatedProperties,
  ListPropertiesParams,
  PropertyCreatePayload,
  PropertyUpdatePayload,
  PropertyImage,
} from "./properties";
export {
  createLead,
  listLeads,
  getLead,
  updateLead,
  updateLeadStage,
  listLeadNotes,
  createLeadNote,
} from "./leads";
export type {
  Lead,
  LeadCreatePayload,
  LeadStage,
  LeadUpdatePayload,
  LeadNote,
  PaginatedLeads,
} from "./leads";
export {
  listFavorites,
  listFavoriteIds,
  addFavorite,
  removeFavorite,
} from "./favorites";
export type { FavoriteItem, PaginatedFavorites } from "./favorites";
export {
  listSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  savedSearchHref,
} from "./savedSearches";
export type {
  SavedSearch,
  SavedSearchCriteria,
  SavedSearchCreatePayload,
  PaginatedSavedSearches,
} from "./savedSearches";
export {
  getCustomerDashboard,
  getCustomerProfile,
  updateCustomerProfile,
  listCustomerInquiries,
} from "./customer";
export type {
  CustomerDashboard,
  CustomerProfile,
  CustomerProfilePreferences,
  CustomerInquiry,
  PaginatedInquiries,
} from "./customer";
export { getChatGreeting, aiChat } from "./chat";
export type {
  AiChatRequest,
  AiChatResponse,
  AiChatGreeting,
  ChatHistoryItem,
} from "./chat";
export { analyzeLoan } from "./loan";
export type { AiLoanAnalysisRequest, AiLoanAnalysisResponse } from "./loan";
export { getAiConfig, updateAiConfig, previewAiConfig } from "./aiConfig";
export type {
  AiConfig,
  AiConfigUpdate,
  AiConfigPreviewResponse,
  AiFaq,
  AiEscalation,
} from "./aiConfig";
export { aiSearch, searchSuggest, searchThumbSrc } from "./search";
export type {
  AiSearchRequest,
  AiSearchResponse,
  AiSearchResultItem,
  AiSearchFilters,
  SearchMatchReason,
} from "./search";
export {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notifications";
export type { NotificationItem, NotificationsListResponse } from "./notifications";
export {
  listNotificationRules,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
} from "./notificationRules";
export type {
  NotificationRule,
  NotificationRulesListResponse,
  NotificationRuleCreate,
  NotificationRuleUpdate,
  NotificationChannel,
} from "./notificationRules";
export {
  getCmsHomepage,
  getPublishedPage,
  listCmsPages,
  getCmsPage,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
} from "./cms";
export type {
  CmsPage,
  CmsPagesListResponse,
  CmsPageCreate,
  CmsPageUpdate,
  CmsPageStatus,
} from "./cms";
export {
  validateBulkProperties,
  getBulkSession,
  importBulkSession,
  downloadBulkErrorsCsv,
  parseCsvToRecords,
} from "./bulk";
export type { BulkValidateResponse, BulkSession, BulkRowIssue } from "./bulk";
export { getMetricsDashboard, getMetricsReports } from "./metrics";
export type { MetricsDashboard, MetricsReport, MetricsKpi } from "./metrics";
export { createVisit } from "./visits";
export type { Visit, VisitCreatePayload } from "./visits";


