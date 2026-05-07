import { useEffect, useMemo, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAdminLogs, getAdminUser, type AdminLog, type AdminUserRow } from "@/lib/api";
import { Search } from "lucide-react";

export default function Logs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<AdminLog | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserRow | null>(null);
  const [actorDetail, setActorDetail] = useState<AdminUserRow | null>(null);
  const perPage = 12;
  useEffect(() => { getAdminLogs(true).then((r) => setLogs(r.logs)); }, []);
  const filtered = useMemo(() => logs.filter((l) => `${l.action} ${l.entityType} ${l.entityId} ${l.description} ${l.actor?.username || ""}`.toLowerCase().includes(q.toLowerCase())), [logs, q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const list = filtered.slice((page - 1) * perPage, page * perPage);
  async function view(log: AdminLog) { setOpen(log); if (log.entityType === "USER") { const res = await getAdminUser(log.entityId); setUserDetail(res.user); } else setUserDetail(null); }

  return <AdminLayout>
    <PageHeader title="Logs" description="Who did what, on what, and why." />
    <Card className="p-4 mb-4"><div className="relative max-w-md"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Search logs..." /></div></Card>
    <Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Action</th><th className="px-4 py-3 text-left">Entity</th><th className="px-4 py-3 text-left">By</th><th className="px-4 py-3 text-left">When</th><th className="px-4 py-3 text-right">View</th></tr></thead><tbody>{list.map((l) => <tr className="border-t" key={l.id}><td className="px-4 py-3">{l.action}<div className="text-xs text-muted-foreground">{l.description}</div></td><td className="px-4 py-3">{l.entityType}#{l.entityId}</td><td className="px-4 py-3">{l.actor ? <button type="button" className="text-link" onClick={() => void getAdminUser(l.actor!.id).then((r) => setActorDetail(r.user))}>@{l.actor.username}{l.actor.role ? ` (${l.actor.role})` : ""}</button> : "System"}</td><td className="px-4 py-3">{new Date(l.createdAt).toLocaleString()}</td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => void view(l)}>View</Button></td></tr>)}</tbody></table></Card>
    <div className="mt-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>
    <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}><DialogContent>{open ? <><DialogHeader><DialogTitle>Log detail</DialogTitle></DialogHeader><div className="space-y-2 text-sm"><div><strong>Action:</strong> {open.action}</div><div><strong>Target:</strong> {open.entityType}#{open.entityId}</div><div><strong>Why:</strong> {open.description}</div>{userDetail ? <div className="rounded border p-3"><strong>User view:</strong> {userDetail.firstName} {userDetail.lastName} (@{userDetail.username}) - {userDetail.role} - {userDetail.accountStatus}</div> : null}</div></> : null}</DialogContent></Dialog>
    <Dialog open={!!actorDetail} onOpenChange={(o) => !o && setActorDetail(null)}><DialogContent>{actorDetail ? <><DialogHeader><DialogTitle>Admin profile</DialogTitle></DialogHeader><div className="space-y-2 text-sm"><div><strong>Name:</strong> {actorDetail.firstName} {actorDetail.lastName}</div><div><strong>Username:</strong> @{actorDetail.username}</div><div><strong>Email:</strong> {actorDetail.email}</div><div><strong>Role:</strong> {actorDetail.role}</div></div></> : null}</DialogContent></Dialog>
  </AdminLayout>;
}
