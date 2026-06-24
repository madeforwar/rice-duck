import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/auth";
import type { AuthUser, LoginRequest, RegisterRequest } from "../types/api";
import {
  clearAuthSession,
  getAuthSessionChangeEventName,
  isTokenExpired,
  readAuthSession,
  saveAuthSession,
} from "../lib/session";

type AuthStatus = "loading" | "guest" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  hasValidSession: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      const session = readAuthSession();
      if (!session || isTokenExpired(session.accessToken)) {
        clearAuthSession();
        setUser(null);
        setStatus("guest");
        return;
      }

      setUser(session.user);
      setStatus("authenticated");
    };

    syncFromStorage();

    const sessionEvent = getAuthSessionChangeEventName();
    window.addEventListener(sessionEvent, syncFromStorage as EventListener);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(sessionEvent, syncFromStorage as EventListener);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  useEffect(() => {
    const session = readAuthSession();
    if (!session || isTokenExpired(session.accessToken)) {
      if (status === "loading") {
        setStatus("guest");
      }
      return;
    }

    getCurrentUser()
      .then((me) => {
        saveAuthSession({
          ...session,
          user: me,
        });
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
        setStatus("guest");
      });
  }, [status]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      hasValidSession: status === "authenticated" && Boolean(user),
      async login(payload) {
        const result = await loginUser({
          ...payload,
          email: payload.email.trim().toLowerCase(),
        });

        saveAuthSession({
          accessToken: result.access_token,
          tokenType: result.token_type,
          user: result.user,
        });
        setUser(result.user);
        setStatus("authenticated");
      },
      async register(payload) {
        await registerUser({
          ...payload,
          email: payload.email.trim().toLowerCase(),
        });
      },
      logout() {
        clearAuthSession();
        setUser(null);
        setStatus("guest");
      },
      async refreshProfile() {
        const me = await getCurrentUser();
        const session = readAuthSession();
        if (!session) {
          return;
        }

        saveAuthSession({
          ...session,
          user: me,
        });
        setUser(me);
        setStatus("authenticated");
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
