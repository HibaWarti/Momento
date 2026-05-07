import { useEffect, useMemo, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { blockUser, createUserBySuperadmin, deleteUser, getAdminUser, getAdminUsers, type AdminUserRow, unblockUser } from "@/lib/api";
import { Eye, Search, ShieldX, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Users() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", email: "", password: "", role: "USER" as "USER" | "ADMIN" });
  const perPage = 10;
  async function load() { const res = await getAdminUsers(); setRows(res.users); }
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => rows.filter((u) => `${u.firstName} ${u.lastName} ${u.username} ${u.email}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const list = filtered.slice((page - 1) * perPage, page * perPage);
  async function view(id: string) { const res = await getAdminUser(id); setDetail(res.user); setViewId(id); }
  async function createUser() {
    await createUserBySuperadmin(form);
    toast.success("User created");
    setCreateOpen(false);
    setForm({ firstName: "", lastName: "", username: "", email: "", password: "", role: "USER" });
    await load();
  }

  return (
    <AdminLayout>
      <PageHeader title="Users" description="Search, paginate, and moderate all users." actions={<Button onClick={() => setCreateOpen(true)}><UserPlus className="h-4 w-4 mr-2" />Create user</Button>} />
      <Card className="p-4 mb-4"><div className="relative max-w-md"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Search users..." /></div></Card>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Reports</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{list.map((u) => <tr key={u.id} className="border-t"><td className="px-4 py-3">{u.firstName} {u.lastName} (@{u.username})</td><td className="px-4 py-3">{u.role}</td><td className="px-4 py-3">{u.accountStatus}</td><td className="px-4 py-3">{u.reportsTotal ?? 0}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="icon" variant="outline" onClick={() => void view(u.id)}><Eye className="h-4 w-4" /></Button><Button size="icon" variant="outline" onClick={() => void (u.accountStatus === "BLOCKED" ? unblockUser(u.id) : blockUser(u.id)).then(load)}><ShieldX className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => void deleteUser(u.id).then(() => { toast.success("User deleted"); return load(); })}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}</tbody></table></Card>
      <div className="mt-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>
      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}><DialogContent>{detail ? <><DialogHeader><DialogTitle>User view</DialogTitle></DialogHeader><div className="space-y-2 text-sm">{detail.profilePicturePath ? <img src={`http://localhost:3000${detail.profilePicturePath}`} className="h-16 w-16 rounded-full object-cover border" /> : null}<div><strong>Name:</strong> {detail.firstName} {detail.lastName}</div><div><strong>Username:</strong> @{detail.username}</div><div><strong>Email:</strong> {detail.email}</div><div><strong>Reports:</strong> {detail.reportsTotal ?? 0}</div>{detail.providerProfile ? <div className="rounded border p-3 space-y-1"><div className="font-medium">Professional info</div><div>{detail.providerProfile.professionalName || ""}</div><div>{detail.providerProfile.professionalDescription || ""}</div><div>{detail.providerProfile.city || ""} {detail.providerProfile.phone || ""}</div></div> : null}</div><DialogFooter><Button variant="outline" onClick={() => setViewId(null)}>Close</Button></DialogFooter></> : null}</DialogContent></Dialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader><div className="space-y-2"><Input placeholder="First name" value={form.firstName} onChange={(e) => setForm((v) => ({ ...v, firstName: e.target.value }))} /><Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm((v) => ({ ...v, lastName: e.target.value }))} /><Input placeholder="Username" value={form.username} onChange={(e) => setForm((v) => ({ ...v, username: e.target.value }))} /><Input placeholder="Email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} /><Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} /><select className="h-10 rounded-md border px-3 text-sm w-full bg-background" value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value as any }))}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></div><DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => void createUser()}>Create</Button></DialogFooter></DialogContent></Dialog>
    </AdminLayout>
  );
}
