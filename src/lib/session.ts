import type { AuthUser } from "../types/api";

const AUTH_STORAGE_KEY = "rice-duck-auth-session";
const AUTH_EVENT_NAME = "rice-duck-auth-session-changed";

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

function emitSessionChange() {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
}

export function getAuthSessionChangeEventName() {
  return AUTH_EVENT_NAME;
}

export function readAuthSession(): AuthSession | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  emitSessionChange();
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  emitSessionChange();
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return window.atob(padded);
}

export function decodeJwtPayload(token: string): { exp?: number; sub?: string } | null {
  const segments = token.split(".");
  if (segments.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(segments[1])) as { exp?: number; sub?: string };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewSeconds = 15) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + skewSeconds;
}
