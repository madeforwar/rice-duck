import { API_BASE_URL } from "../config/api";
import { ApiError, toApiError } from "./api-error";
import { clearAuthSession, isTokenExpired, readAuthSession } from "./session";

type AuthMode = "none" | "optional" | "required";

interface ApiFetchOptions extends RequestInit {
  authMode?: AuthMode;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { authMode = "none", headers, body, ...rest } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const session = readAuthSession();
  const hasToken = Boolean(session?.accessToken);
  const validToken = hasToken && !isTokenExpired(session!.accessToken);

  if (hasToken && !validToken) {
    clearAuthSession();
  }

  if (authMode === "required" && (!session || !validToken)) {
    throw new ApiError(401, "unauthorized", "Sesi login sudah berakhir. Silakan masuk ulang.");
  }

  if ((authMode === "required" || authMode === "optional") && session && validToken) {
    requestHeaders.set("Authorization", `${session.tokenType} ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body,
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    throw toApiError(response.status, parsedBody);
  }

  return parsedBody as T;
}
