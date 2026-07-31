export { apiRequest, ApiError, AppError, configureApiAuth } from "./client";
export { getHealth } from "./health";
export { register, login, refresh, logout, getMe } from "./auth";
export type { RegisterPayload, LoginPayload } from "./auth";
