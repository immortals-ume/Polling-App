"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PageLoading } from "./ui/PageLoading";

/**
 * Client-side route guard matching the original SPA's PrivateRoute.
 * There's no server-rendered session (auth is a JWT in localStorage),
 * so this can't be a true server-protected route — it briefly shows a
 * loading state while the current user loads, then redirects to /login
 * if unauthenticated. This is an intentional, inherited limitation of
 * the original client-side-only auth model, not a regression.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
