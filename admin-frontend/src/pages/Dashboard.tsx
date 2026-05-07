import { useEffect, useMemo, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { getAdminLogs, getAdminStats, getProviderRequests, getReports, type AdminLog, type AdminStats, type ProviderRequest, type Report } from "@/lib/api";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const isSuper = user?.role === "SUPERADMIN";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  useEffect(() => {
    getAdminStats(isSuper).then((r) => setStats(r.stats));
    getAdminLogs(isSuper).then((r) => setLogs(r.logs));
    getReports().then((r) => setReports(r.reports));
    getProviderRequests().then((r) => setRequests(r.providerRequests));
  }, [isSuper]);
  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    logs.forEach((l) => { const key = new Date(l.createdAt).toLocaleDateString(); byDay.set(key, (byDay.get(key) || 0) + 1); });
    return [...byDay.entries()].slice(-10).map(([day, actions]) => ({ day, actions }));
  }, [logs]);
  const statsRows = stats ? [
    ["Total users", stats.totalUsers], ["Blocked users", stats.blockedUsers], ["Total providers", stats.totalProviders], ["Pending provider requests", stats.pendingProviderRequests], ["Total posts", stats.totalPosts], ["Total services", stats.totalServices], ["Total reports", stats.totalReports], ["Pending reports", stats.pendingReports], ["Total tickets", stats.totalTickets], ["Total reviews", stats.totalReviews],
  ] : [];
  const reportsByStatus = useMemo(() => ["PENDING", "REVIEWING", "RESOLVED", "REJECTED"].map((s) => ({ key: s, value: reports.filter((r) => r.status === s).length })), [reports]);
  const requestsByStatus = useMemo(() => ["PENDING", "REVIEWING", "APPROVED", "REJECTED"].map((s) => ({ key: s, value: requests.filter((r) => r.status === s).length })), [requests]);
  const reportTypeGrowth = useMemo(() => {
    const days = new Map<string, { day: string; post: number; comment: number; user: number; service: number }>();
    reports.forEach((r) => {
      const day = new Date(r.createdAt).toLocaleDateString();
      if (!days.has(day)) days.set(day, { day, post: 0, comment: 0, user: 0, service: 0 });
      const bucket = days.get(day)!;
      if (r.post) bucket.post += 1; else if (r.comment) bucket.comment += 1; else if (r.service) bucket.service += 1; else bucket.user += 1;
    });
    return [...days.values()].slice(-10);
  }, [reports]);
  const colors = ["#3b82f6", "#a855f7", "#f97316", "#14b8a6"];

  return <AdminLayout>
    <PageHeader title="Dashboard" description={isSuper ? "Superadmin overview with grouped stats and charts." : "Admin overview."} />
    <h2 className="text-sm uppercase text-muted-foreground mb-2">Stats</h2>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">{statsRows.map(([k, v]) => <Card key={k as string} className="p-4"><div className="text-xs text-muted-foreground">{k as string}</div><div className="text-2xl font-semibold">{v as number}</div></Card>)}</div>
    <h2 className="text-sm uppercase text-muted-foreground mb-2">Charts</h2>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-4"><div className="font-medium mb-3">Moderation actions (last days)</div><ResponsiveContainer width="100%" height={260}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="actions" fill="#3b82f6" /></BarChart></ResponsiveContainer></Card>
      <Card className="p-4"><div className="font-medium mb-3">Core platform totals</div><ResponsiveContainer width="100%" height={260}><LineChart data={[{ k: "Users", v: stats?.totalUsers || 0 }, { k: "Posts", v: stats?.totalPosts || 0 }, { k: "Services", v: stats?.totalServices || 0 }, { k: "Reports", v: stats?.totalReports || 0 }, { k: "Tickets", v: stats?.totalTickets || 0 }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="k" /><YAxis /><Tooltip /><Line dataKey="v" stroke="#8b5cf6" strokeWidth={2} /></LineChart></ResponsiveContainer></Card>
      <Card className="p-4"><div className="font-medium mb-3">Report growth by type</div><ResponsiveContainer width="100%" height={260}><LineChart data={reportTypeGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line dataKey="post" stroke="#3b82f6" /><Line dataKey="comment" stroke="#a855f7" /><Line dataKey="user" stroke="#f97316" /><Line dataKey="service" stroke="#14b8a6" /></LineChart></ResponsiveContainer></Card>
      <Card className="p-4"><div className="font-medium mb-3">Reports by status</div><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={reportsByStatus} dataKey="value" nameKey="key" innerRadius={50} outerRadius={90}>{reportsByStatus.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Card>
      <Card className="p-4"><div className="font-medium mb-3">Provider requests by status</div><ResponsiveContainer width="100%" height={260}><BarChart data={requestsByStatus}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="key" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#0ea5e9" /></BarChart></ResponsiveContainer></Card>
    </div>
  </AdminLayout>;
}
