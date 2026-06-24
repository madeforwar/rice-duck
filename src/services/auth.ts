import { apiFetch } from "../lib/http";
import type { AuthUser, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/api";

const AUTH_PREFIX = "/api/v1/auth";

export function registerUser(payload: RegisterRequest) {
  return apiFetch<RegisterResponse>(`${AUTH_PREFIX}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginRequest) {
  return apiFetch<LoginResponse>(`${AUTH_PREFIX}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return apiFetch<AuthUser>(`${AUTH_PREFIX}/me`, {
    authMode: "required",
  });
}
