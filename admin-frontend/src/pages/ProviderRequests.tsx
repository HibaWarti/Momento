import { useEffect, useMemo, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { approveProviderRequest, getProviderRequest, getProviderRequests, ProviderRequest, rejectProviderRequest, reviewProviderRequest } from "@/lib/api";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function ProviderRequestsPage() {
  const [rows, setRows] = useState<ProviderRequest[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProviderRequest | null>(null);
  const perPage = 8;
  async function load() { const res = await getProviderRequests(); setRows(res.providerRequests); }
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => rows.filter((r) => `${r.professionalName} ${r.city} ${r.user.username}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const list = filtered.slice((page - 1) * perPage, page * perPage);
  async function openView(id: string) { await reviewProviderRequest(id); const res = await getProviderRequest(id); setDetail(res.providerRequest); setOpenId(id); await load(); }

  return (
    <AdminLayout>
      <PageHeader title="Provider requests" description="Identity verification queue." />
      <Card className="p-4 mb-4"><div className="relative max-w-md"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Search requests..." /></div></Card>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Professional</th><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">City</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{list.map((r) => <tr className="border-t" key={r.id}><td className="px-4 py-3">{r.professionalName}</td><td className="px-4 py-3">@{r.user.username}</td><td className="px-4 py-3">{r.city}</td><td className="px-4 py-3">{r.status}</td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => void openView(r.id)}>View</Button></td></tr>)}</tbody></table></Card>
      <div className="mt-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>
      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}><DialogContent className="max-w-2xl">{detail ? <><DialogHeader><DialogTitle>{detail.professionalName}</DialogTitle></DialogHeader><div className="space-y-2 text-sm"><div><strong>User:</strong> @{detail.user.username} ({detail.user.firstName} {detail.user.lastName})</div><div><strong>City:</strong> {detail.city}</div><div><strong>Phone:</strong> {detail.phone}</div><div><strong>CIN:</strong> {detail.cinNumber}</div><div><strong>Description:</strong> {detail.professionalDescription}</div><img src={`http://localhost:3000${detail.cinPicturePath}`} className="h-44 w-full object-cover rounded border" /></div><DialogFooter className="gap-2"><Button variant="outline" onClick={() => void rejectProviderRequest(detail.id).then(() => { toast.success("Rejected"); setOpenId(null); return load(); })}>Reject</Button><Button onClick={() => void approveProviderRequest(detail.id).then(() => { toast.success("Approved"); setOpenId(null); return load(); })}>Approve</Button></DialogFooter></> : null}</DialogContent></Dialog>
    </AdminLayout>
  );
}
