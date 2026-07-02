"use client";

import { clearUsername, getUser } from "@/lib/helper";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  username: string | undefined;
  isAuthenticated: boolean;
  isChecking: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function subscribeToUserStorage(onStoreChange: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === "username" || event.key === "session_id") {
      onStoreChange();
    }
  };

  const handleUserChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("digikelas:user", handleUserChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("digikelas:user", handleUserChange);
  };
}

function getUserSnapshot() {
  return getUser();
}

function getServerSnapshot(): null {
  return null;
}

export function AuthProvider({
  children,
  requireAuth = false,
}: Readonly<{
  children: React.ReactNode;
  requireAuth?: boolean;
}>) {
  const router = useRouter();
  const username = useSyncExternalStore(
    subscribeToUserStorage,
    getUserSnapshot,
    getServerSnapshot,
  );
  
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function validateSession() {
      // Defers execution to a microtask to avoid synchronous setState inside useEffect
      await Promise.resolve();
      
      if (username === null) {
        // Masih dalam fase hydrasi Next.js, tunggu hingga snapshot client dimuat
        return;
      }

      if (username === undefined) {
        // Memang tidak ada username di localStorage
        if (isMounted) setIsSessionValid(false);
        return;
      }

      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        if (isMounted) setIsSessionValid(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("id")
          .eq("id", sessionId)
          .eq("name", username)
          .single();

        if (error || !data) {
          if (isMounted) setIsSessionValid(false);
        } else {
          if (isMounted) setIsSessionValid(true);
        }
      } catch (err) {
        if (isMounted) setIsSessionValid(false);
      }
    }

    if (requireAuth) {
      validateSession();
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setIsSessionValid(Boolean(username));
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [username, requireAuth]);

  const isChecking = requireAuth ? isSessionValid === null : username === null;
  const isAuthenticated = requireAuth ? isSessionValid === true : Boolean(username);

  useEffect(() => {
    if (requireAuth && !isChecking && !isAuthenticated) {
      clearUsername();
      router.replace("/get-started");
    }
  }, [isAuthenticated, isChecking, requireAuth, router]);

  const logout = useCallback(() => {
    clearUsername();
    router.replace("/get-started");
  }, [router]);

  const value = useMemo(
    () => ({
      username: username ?? undefined,
      isAuthenticated,
      isChecking,
      logout,
    }),
    [isAuthenticated, isChecking, logout, username],
  );

  if (requireAuth && (isChecking || !isAuthenticated)) {
    return (
      <AuthContext.Provider value={value}>
        <div className="relative z-10 rounded-4xl border-[3px] border-border bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-base font-bold text-primary">
            Menyiapkan kelas...
          </p>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
