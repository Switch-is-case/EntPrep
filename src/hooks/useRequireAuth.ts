"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";

interface UseRequireAuthOptions {
  redirectTo?: string;
  requireVerified?: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = "/login", requireVerified = false } = options;
  const router = useRouter();
  const { user, ready, token, lang, authHeaders, logout } = useApp();
  
  useEffect(() => {
    if (!ready) return;
    
    // Not logged in
    if (!user || !token) {
      router.replace(redirectTo);
      return;
    }
    
    // Logged in but not verified (if required)
    if (requireVerified && !user.emailVerified) {
      router.replace("/verify-email-pending");
      return;
    }
  }, [ready, user, token, router, redirectTo, requireVerified]);
  
  return {
    user,
    ready,
    token,
    lang,
    authHeaders,
    logout,
    isAuthenticated: ready && !!user && !!token,
    isVerified: ready && !!user?.emailVerified,
  };
}
