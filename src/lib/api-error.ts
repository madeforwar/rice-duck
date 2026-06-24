import type { BackendErrorPayload, BackendErrorResponse } from "../types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: BackendErrorPayload["code"] | "unknown_error";
  readonly field: string | null;
  readonly issues: BackendErrorResponse["error"]["issues"];

  constructor(
    status: number,
    code: BackendErrorPayload["code"] | "unknown_error",
    message: string,
    field: string | null = null,
    issues: BackendErrorResponse["error"]["issues"] = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.field = field;
    this.issues = issues;
  }
}

export function toApiError(status: number, payload: unknown) {
  const errorPayload = (payload as BackendErrorResponse | null)?.error;
  if (!errorPayload) {
    return new ApiError(status, "unknown_error", "Terjadi kesalahan saat menghubungi backend.");
  }

  return new ApiError(
    status,
    errorPayload.code,
    errorPayload.message,
    errorPayload.field,
    errorPayload.issues,
  );
}
