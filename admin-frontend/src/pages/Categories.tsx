import { useEffect, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategory, deleteCategory, getCategories, renameCategory, type CategoryMap } from "@/lib/api";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryMap[]>([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [nextCategory, setNextCategory] = useState("");
  const [nextSubcategory, setNextSubcategory] = useState("");
  async function load() { const res = await getCategories(); setRows(res.categories); }
  useEffect(() => { void load(); }, []);
  return <AdminLayout>
    <PageHeader title="Categories" description="Superadmin category and subcategory management." />
    <Card className="p-4 mb-4 space-y-3">
      <div className="grid md:grid-cols-4 gap-2"><Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} /><Input placeholder="Subcategory (optional)" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} /><Button onClick={() => void createCategory({ category, subcategory }).then(() => { toast.success("Added"); setCategory(""); setSubcategory(""); return load(); })}>Add</Button></div>
      <div className="grid md:grid-cols-5 gap-2"><Input placeholder="Current category" value={category} onChange={(e) => setCategory(e.target.value)} /><Input placeholder="Current subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} /><Input placeholder="New category" value={nextCategory} onChange={(e) => setNextCategory(e.target.value)} /><Input placeholder="New subcategory" value={nextSubcategory} onChange={(e) => setNextSubcategory(e.target.value)} /><Button variant="outline" onClick={() => void renameCategory({ category, subcategory: subcategory || undefined, nextCategory, nextSubcategory: nextSubcategory || undefined }).then(() => { toast.success("Updated"); return load(); })}>Edit</Button></div>
    </Card>
    <Card className="overflow-hidden">
      <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Subcategories</th><th className="px-4 py-3 text-right">Delete</th></tr></thead><tbody>{rows.map((r) => <tr className="border-t" key={r.category}><td className="px-4 py-3 font-medium">{r.category}</td><td className="px-4 py-3">{r.subcategories.join(", ") || "-"}</td><td className="px-4 py-3 text-right"><Button size="sm" variant="destructive" onClick={() => void deleteCategory({ category: r.category }).then(() => { toast.success("Deleted"); return load(); })}>Delete</Button></td></tr>)}</tbody></table>
    </Card>
  </AdminLayout>;
}
