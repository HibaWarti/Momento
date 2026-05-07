import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authTokenKey, getMe, login as loginApi } from "@/lib/api";

export type AdminRole = "ADMIN" | "SUPERADMIN";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: AdminRole;
  profilePicturePath?: string;
}

interface AuthCtx {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "momento.admin.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* noop */ }
    }
    if (localStorage.getItem(authTokenKey)) {
      getMe().then((res) => {
        if (res.user.role === "ADMIN" || res.user.role === "SUPERADMIN") {
          setUser(res.user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        }
      }).catch(() => undefined);
    }
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      if (res.user.role !== "ADMIN" && res.user.role !== "SUPERADMIN") {
        return { ok: false, error: "This portal is reserved to admins." };
      }
      localStorage.setItem(authTokenKey, res.token);
      setUser(res.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid email or password.";
      return { ok: false, error: message };
    }
    return { ok: false, error: "Login failed" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(authTokenKey);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
