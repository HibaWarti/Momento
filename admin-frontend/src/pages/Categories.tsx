import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout, PageHeader } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createCategory,
  deleteCategory,
  getCategories,
  renameCategory,
  type CategoryMap,
} from "@/lib/api";

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryMap[]>([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [nextCategory, setNextCategory] = useState("");
  const [nextSubcategory, setNextSubcategory] = useState("");
  const [loading, setLoading] = useState(false);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.category.localeCompare(b.category)),
    [rows],
  );

  async function load() {
    setLoading(true);
    try {
      const res = await getCategories();
      setRows(res.categories);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleAdd() {
    await createCategory({ category, subcategory: subcategory || undefined });
    toast.success(subcategory ? "Subcategory added" : "Category added");
    setCategory("");
    setSubcategory("");
    await load();
  }

  async function handleEdit() {
    await renameCategory({
      category,
      subcategory: subcategory || undefined,
      nextCategory,
      nextSubcategory: nextSubcategory || undefined,
    });
    toast.success(subcategory ? "Subcategory updated" : "Category updated");
    setNextCategory("");
    setNextSubcategory("");
    await load();
  }

  async function handleDelete(targetCategory: string, targetSubcategory?: string) {
    await deleteCategory({ category: targetCategory, subcategory: targetSubcategory });
    toast.success(targetSubcategory ? "Subcategory deleted" : "Category deleted");
    await load();
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Categories"
        description="Manage real service categories and provider-created subcategories."
      />

      <Card className="p-4 mb-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-2">
          <Input
            placeholder="Category, e.g. Traiteur"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <Input
            placeholder="Subcategory, e.g. Chinese Food"
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
          />
          <Button onClick={() => void handleAdd()} disabled={!category.trim()}>
            Add
          </Button>
        </div>

        <div className="grid md:grid-cols-5 gap-2">
          <Input
            placeholder="Current category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <Input
            placeholder="Current subcategory (optional)"
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
          />
          <Input
            placeholder="New category"
            value={nextCategory}
            onChange={(event) => setNextCategory(event.target.value)}
          />
          <Input
            placeholder="New subcategory"
            value={nextSubcategory}
            onChange={(event) => setNextSubcategory(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => void handleEdit()}
            disabled={!category.trim() || !nextCategory.trim()}
          >
            Edit
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Subcategories</th>
              <th className="px-4 py-3 text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr className="border-t align-top" key={row.id ?? row.category}>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.category}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.servicesCount ?? 0} linked services
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {(row.subcategoryRows?.length
                      ? row.subcategoryRows
                      : row.subcategories.map((name) => ({ id: name, name }))
                    ).map((item) => (
                      <span key={item.id} className="inline-flex items-center gap-1">
                        <Badge variant="secondary">
                          {item.name}
                          {"servicesCount" in item && item.servicesCount !== undefined
                            ? ` (${item.servicesCount})`
                            : ""}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-destructive"
                          onClick={() => void handleDelete(row.category, item.name)}
                        >
                          Delete
                        </Button>
                      </span>
                    ))}
                    {!row.subcategories.length ? (
                      <span className="text-muted-foreground">No subcategories</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDelete(row.category)}
                  >
                    Delete category
                  </Button>
                </td>
              </tr>
            ))}
            {!sortedRows.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>
                  {loading ? "Loading categories..." : "No categories yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}
