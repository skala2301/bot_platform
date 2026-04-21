/**
 * Generic `{ "message": "..." }` response shape returned by several backend
 * endpoints (e.g. transfer ownership, verify-email, forgot-password,
 * reset-password, logout).
 */
export interface MessageResponse {
  message: string;
}
