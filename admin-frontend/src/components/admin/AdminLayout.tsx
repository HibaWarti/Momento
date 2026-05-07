import { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Flag, BadgeCheck, Users, ScrollText, LogOut, ShieldCheck, Tags,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem { to: string; label: string; icon: typeof Flag; superOnly?: boolean }

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Reports", icon: Flag },
  { to: "/provider-requests", label: "Provider requests", icon: BadgeCheck },
  { to: "/users", label: "Users", icon: Users, superOnly: true },
  { to: "/categories", label: "Categories", icon: Tags, superOnly: true },
  { to: "/logs", label: "Admin logs", icon: ScrollText, superOnly: true },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="fixed inset-y-0 left-0 w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center shadow-elevated">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sidebar-primary-foreground font-semibold leading-tight">Momento</div>
            <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">Backoffice</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.filter((i) => !i.superOnly || user?.role === "SUPERADMIN").map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.superOnly && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground/90">
                    SUPER
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm text-sidebar-primary-foreground font-medium">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] text-sidebar-foreground/60">{user?.role}</div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
            onClick={() => { logout(); navigate("/login"); }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 ml-64">
        <div className="max-w-[1400px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
