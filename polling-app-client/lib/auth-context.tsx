"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "./api";
import { ACCESS_TOKEN } from "./constants";
import { CurrentUser } from "./types";
import { useNotify } from "./notify";

interface AuthContextValue {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: (redirectTo?: string, reason?: string, severity?: "success" | "error") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const notify = useNotify();

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(
    async (accessToken: string) => {
      window.localStorage.setItem(ACCESS_TOKEN, accessToken);
      await loadCurrentUser();
      notify.success({
        message: "Polling App",
        description: "You're successfully logged in.",
      });
      router.push("/");
    },
    [loadCurrentUser, notify, router]
  );

  const logout = useCallback(
    (
      redirectTo = "/",
      reason = "You're successfully logged out.",
      severity: "success" | "error" = "success"
    ) => {
      window.localStorage.removeItem(ACCESS_TOKEN);
      setCurrentUser(null);
      router.push(redirectTo);
      notify[severity]({ message: "Polling App", description: reason });
    },
    [notify, router]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
      login,
      logout,
    }),
    [currentUser, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
