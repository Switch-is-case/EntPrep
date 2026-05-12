"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";

export interface User {
  id: string;
  email: string;
  name: string;
  language: string;
  profileSubject1: string | null;
  profileSubject2: string | null;
  targetCombinationId?: number | null;
  targetSpecialtyId?: number | null;
  targetUniversityId?: number | null;
  targetScore?: number | null;
  needsReonboarding?: boolean;
  emailVerified?: boolean;
  isAdmin?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  deletedAt?: string | null;
}

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  authHeaders: () => Record<string, string>;
  ready: boolean;
  isFullPageMode: boolean;
  setIsFullPageMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  lang: "ru",
  setLang: () => {},
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  refreshUser: async () => {},
  authHeaders: () => ({}),
  ready: false,
  isFullPageMode: false,
  setIsFullPageMode: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user, ready } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && user?.needsReonboarding && window.location.pathname !== "/profile") {
      router.replace("/profile");
    }
  }, [user, ready, router]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isFullPageMode, setIsFullPageMode] = useState(false);
  const router = useRouter();

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ent-lang", l);
  }, []);

  const login = useCallback(
    (newToken: string, newUser: User) => {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("ent-token", newToken);
      localStorage.setItem("ent-user", JSON.stringify(newUser));
      if (newUser.language) setLang(newUser.language as Lang);
    },
    [setLang]
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ent-token");
    localStorage.removeItem("ent-user");
    // Trigger logout in other tabs
    localStorage.setItem("ent-auth-event", "logout");
    localStorage.removeItem("ent-auth-event");
    
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Failed to call logout API:", err);
    }
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem("ent-user", JSON.stringify(u));
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    const tk = localStorage.getItem("ent-token");
    return tk
      ? { "Content-Type": "application/json", Authorization: `Bearer ${tk}` }
      : { "Content-Type": "application/json" };
  }, []);

  const refreshUser = useCallback(async () => {
    const tk = localStorage.getItem("ent-token");
    if (!tk) return;

    try {
      const res = await fetch("/api/profile", { 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` },
        cache: "no-store" 
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        localStorage.setItem("ent-user", JSON.stringify(u));
      } else if (res.status === 401) {
        const data = await res.json();
        if (data.reason === "banned") {
          // If banned, we still logout but redirect specifically to /banned
          const reason = data.banReason || "";
          console.log("[PROVIDERS REDIRECT] Ban reason:", reason);
          console.log("[PROVIDERS REDIRECT] Final URL:", `/banned?reason=${encodeURIComponent(reason)}`);
          logout();
          window.location.href = `/banned?reason=${encodeURIComponent(reason)}`;
        } else {
          // Token is invalid/expired/mismatched/deleted
          logout();
        }
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, [logout, router]);

  // Initial load
  useEffect(() => {
    const savedLang = localStorage.getItem("ent-lang") as Lang;
    if (savedLang) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(savedLang);
    }

    const savedToken = localStorage.getItem("ent-token");
    const savedUser = localStorage.getItem("ent-user");

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("ent-user");
      }
    }
    setReady(true);
    refreshUser();
  }, [refreshUser]);

  // Periodic session check
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token, refreshUser]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ent-user") {
        if (!e.newValue) {
          setUser(null);
        } else {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (err) {
            console.error("Failed to parse synced user:", err);
          }
        }
      }
      if (e.key === "ent-token") {
        setToken(e.newValue);
      }
      if (e.key === "ent-lang" && e.newValue) {
        setLangState(e.newValue as Lang);
      }
      // Broadcasted logout event
      if (e.key === "ent-auth-event" && e.newValue === "logout") {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        user,
        token,
        login,
        logout,
        updateUser,
        refreshUser,
        authHeaders,
        ready,
        isFullPageMode,
        setIsFullPageMode,
      }}
    >
      <OnboardingCheck>{children}</OnboardingCheck>
    </AppContext.Provider>
  );
}
