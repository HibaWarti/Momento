import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) { toast.error(res.error ?? "Login failed"); return; }
    toast.success("Welcome back");
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-sidebar text-sidebar-primary-foreground p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-primary opacity-20" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center shadow-elevated"><ShieldCheck className="h-6 w-6 text-primary-foreground" /></div>
          <div><div className="font-semibold text-lg">Momento</div><div className="text-xs uppercase tracking-widest text-sidebar-foreground/70">Admin Backoffice</div></div>
        </div>
        <div className="relative space-y-4 max-w-md"><h2 className="text-3xl font-semibold leading-tight">Moderate. Approve. Understand.</h2><p className="text-sidebar-foreground/80">One control room for reports, provider requests, users and platform health.</p></div>
        <div className="relative text-xs text-sidebar-foreground/60">Reserved for ADMIN and SUPERADMIN accounts.</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md p-8 shadow-elevated border-border/60">
          <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">Use your administrator credentials.</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@momento.app" /></div>
            <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</> : "Sign in"}</Button>
          </form>
          <div className="mt-6 text-xs text-muted-foreground border-t border-border pt-4">Use real ADMIN or SUPERADMIN credentials from backend.</div>
        </Card>
      </div>
    </div>
  );
}
