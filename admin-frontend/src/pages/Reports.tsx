import { useEffect, useMemo, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminUser, getReport, getReports, rejectReport, Report, resolveReport, reviewReport, type AdminUserRow } from "@/lib/api";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [rows, setRows] = useState<Report[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | Report["status"]>("ALL");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Report | null>(null);
  const [action, setAction] = useState("NO_ACTION");
  const [note, setNote] = useState("");
  const [userView, setUserView] = useState<AdminUserRow | null>(null);
  const perPage = 8;

  async function load() { const res = await getReports(); setRows(res.reports); }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (status !== "ALL" && r.status !== status) return false;
    const hay = `${r.reason} ${r.description || ""} ${r.reportedUser?.username || ""} ${r.reporter?.username || ""}`.toLowerCase();
    return !q.trim() || hay.includes(q.toLowerCase());
  }), [rows, q, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const list = filtered.slice((page - 1) * perPage, page * perPage);

  async function openView(id: string) {
    await reviewReport(id);
    const res = await getReport(id);
    setDetail(res.report);
    setOpenId(id);
    setAction(res.report.status === "REJECTED" ? "NO_ACTION" : "NO_ACTION");
    setNote("");
    await load();
  }

  async function submitResolve() {
    if (!detail) return;
    await resolveReport(detail.id, { actionTaken: action, moderationNote: note });
    toast.success("Report resolved");
    setOpenId(null);
    await load();
  }
  async function submitReject() {
    if (!detail) return;
    await rejectReport(detail.id, { actionTaken: "NO_ACTION", moderationNote: note });
    toast.success("Report rejected");
    setOpenId(null);
    await load();
  }

  return (
    <AdminLayout>
      <PageHeader title="Reports" description="Moderation queue with full context and actions." />
      <Card className="p-4 mb-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative min-w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search reports..." value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
          </div>
          <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v as any); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="REVIEWING">Reviewing</SelectItem><SelectItem value="RESOLVED">Resolved</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Reason</th><th className="px-4 py-3 text-left">Target</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Created</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
          <tbody>
            {list.map((r) => <tr key={r.id} className="border-t"><td className="px-4 py-3">{r.reason}</td><td className="px-4 py-3">{r.comment ? "Comment" : r.post ? "Post" : r.service ? "Service" : "User"}</td><td className="px-4 py-3">{r.status}</td><td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => void openView(r.id)}>View</Button></td></tr>)}
          </tbody>
        </table>
      </Card>
      <div className="mt-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-3xl">
          {detail ? <>
            <DialogHeader><DialogTitle>{detail.reason}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="rounded border p-3">
                <strong>Reporter:</strong>{" "}
                {detail.reporter ? <button className="text-link" type="button" onClick={() => void getAdminUser(detail.reporter!.id).then((r) => setUserView(r.user))}>@{detail.reporter.username}</button> : "N/A"}
                {" | "}
                <strong>Reported user:</strong>{" "}
                {detail.reportedUser ? <button className="text-link" type="button" onClick={() => void getAdminUser(detail.reportedUser!.id).then((r) => setUserView(r.user))}>@{detail.reportedUser.username}</button> : "N/A"}
              </div>
              {detail.post ? <div className="rounded border p-3"><strong>Post:</strong> {detail.post.content}<div className="mt-2 flex gap-2 flex-wrap">{detail.post.images?.slice(0, 6).map((img) => <img key={img.id} src={`http://localhost:3000${img.imagePath}`} className="h-14 w-14 rounded object-cover border" />)}</div></div> : null}
              {detail.comment ? <div className="rounded border p-3"><strong>Comment:</strong> {detail.comment.content}<div className="text-muted-foreground mt-1">{detail.comment.post?.content || ""}</div></div> : null}
              {detail.service ? <div className="rounded border p-3"><strong>Service:</strong> {detail.service.title} ({detail.service.category}{detail.service.subcategory ? ` / ${detail.service.subcategory}` : ""})</div> : null}
              <Label>Action</Label>
              <Select value={action} onValueChange={setAction}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NO_ACTION">No action</SelectItem><SelectItem value="WARN_USER">Warn user</SelectItem><SelectItem value="HIDE_POST">Hide post</SelectItem><SelectItem value="DELETE_COMMENT">Delete comment</SelectItem><SelectItem value="HIDE_SERVICE">Hide service</SelectItem><SelectItem value="BAN_USER">Ban user</SelectItem></SelectContent></Select>
              <Label>Reason / moderation note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this action is taken..." />
            </div>
            <DialogFooter className="gap-2"><Button variant="outline" onClick={() => void submitReject()}>Reject</Button><Button onClick={() => void submitResolve()}>Validate</Button></DialogFooter>
          </> : null}
        </DialogContent>
      </Dialog>
      <Dialog open={!!userView} onOpenChange={(o) => !o && setUserView(null)}>
        <DialogContent>
          {userView ? <>
            <DialogHeader><DialogTitle>User info</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {userView.firstName} {userView.lastName}</div>
              <div><strong>Username:</strong> @{userView.username}</div>
              <div><strong>Email:</strong> {userView.email}</div>
              <div><strong>Role:</strong> {userView.role}</div>
              <div><strong>Status:</strong> {userView.accountStatus}</div>
              <div><strong>Reports:</strong> {userView.reportsTotal ?? 0}</div>
            </div>
          </> : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
