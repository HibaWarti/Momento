import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning border-warning/30",
  REVIEWING: "bg-info/15 text-info border-info/30",
  RESOLVED: "bg-success/15 text-success border-success/30",
  APPROVED: "bg-success/15 text-success border-success/30",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
  ACTIVE: "bg-success/15 text-success border-success/30",
  BLOCKED: "bg-destructive/15 text-destructive border-destructive/30",
  HIDDEN: "bg-muted text-muted-foreground border-border",
  DELETED: "bg-destructive/15 text-destructive border-destructive/30",
  USER: "bg-secondary text-secondary-foreground border-border",
  PROVIDER: "bg-accent/15 text-accent border-accent/30",
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  SUPERADMIN: "bg-gradient-primary text-primary-foreground border-transparent",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cls = MAP[status] ?? "bg-secondary text-secondary-foreground border-border";
  return (
    <span className={cn("inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide", cls, className)}>
      {status}
    </span>
  );
}
