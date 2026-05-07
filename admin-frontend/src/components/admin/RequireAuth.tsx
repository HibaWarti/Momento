import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, AdminRole } from "@/lib/auth";

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: AdminRole[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
