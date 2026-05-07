export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "momento.admin.token";

type ReqOpts = { method?: string; body?: unknown; auth?: boolean };

async function apiRequest<T>(path: string, opts: ReqOpts = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers({ "Content-Type": "application/json" });
  if (opts.auth !== false && token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data as T;
}

export type AdminUser = { id: string; firstName: string; lastName: string; username: string; email: string; role: "ADMIN" | "SUPERADMIN"; profilePicturePath?: string | null };
export type AdminUserRow = { id: string; firstName: string; lastName: string; username: string; email: string; role: "USER" | "PROVIDER" | "ADMIN" | "SUPERADMIN"; accountStatus: "ACTIVE" | "BLOCKED" | "DELETED"; createdAt: string; reportsTotal?: number; providerProfile?: { professionalName?: string; professionalDescription?: string; phone?: string; city?: string; cinNumber?: string; cinPicturePath?: string } | null; _count?: { posts?: number; followers?: number; following?: number } };
export type Report = { id: string; reason: string; description?: string | null; status: "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED"; createdAt: string; reporter?: AdminUserRow; reportedUser?: AdminUserRow | null; post?: { id: string; content: string; images: Array<{ id: string; imagePath: string }>; author?: AdminUserRow }; comment?: { id: string; content: string; user?: AdminUserRow; post?: { id: string; content: string } } | null; service?: { id: string; title: string; description: string; category: string; subcategory?: string | null } | null };
export type ProviderRequest = { id: string; professionalName: string; professionalDescription: string; phone: string; city: string; cinNumber: string; cinPicturePath: string; additionalInfo?: string | null; status: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED"; submittedAt: string; user: AdminUserRow };
export type AdminLog = { id: string; action: string; entityType: string; entityId: string; description: string; createdAt: string; actor?: { id: string; username: string; role?: string } | null };
export type AdminStats = { totalUsers: number; blockedUsers: number; totalPosts: number; totalServices: number; totalReports: number; pendingReports: number; totalTickets: number; pendingProviderRequests: number; totalProviders: number; totalReviews: number };
export type AdminTicket = { id: string; subject: string; description: string; category: string; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"; status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED"; createdAt: string; updatedAt: string; user?: AdminUserRow; relatedPost?: { id: string; content: string } | null; relatedComment?: { id: string; content: string } | null; messages?: Array<{ id: string; message: string; isStaff: boolean; createdAt: string }> };
export type CategoryMap = { category: string; subcategories: string[] };

export const authTokenKey = TOKEN_KEY;
export const login = (email: string, password: string) => apiRequest<{ token: string; user: AdminUser }>("/auth/login", { method: "POST", body: { email, password }, auth: false });
export const getMe = () => apiRequest<{ user: AdminUser }>("/auth/me");
export const getAdminUsers = () => apiRequest<{ users: AdminUserRow[] }>("/admin/users");
export const getAdminUser = (id: string) => apiRequest<{ user: AdminUserRow }>("/admin/users/" + id);
export const blockUser = (id: string) => apiRequest<{ success: boolean }>(`/admin/users/${id}/block`, { method: "PATCH" });
export const unblockUser = (id: string) => apiRequest<{ success: boolean }>(`/admin/users/${id}/unblock`, { method: "PATCH" });
export const changeUserRole = (id: string, role: AdminUserRow["role"]) => apiRequest<{ success: boolean }>(`/admin/superadmin/users/${id}/role`, { method: "PATCH", body: { role } });
export const deleteUser = (id: string) => apiRequest<{ success: boolean }>(`/admin/superadmin/users/${id}`, { method: "DELETE" });
export const createAdmin = (userId: string) => apiRequest<{ success: boolean }>(`/admin/superadmin/admins`, { method: "POST", body: { userId } });
export const createUserBySuperadmin = (payload: { firstName: string; lastName: string; username: string; email: string; password: string; role: "USER" | "ADMIN" }) => apiRequest<{ success: boolean }>(`/admin/superadmin/users`, { method: "POST", body: payload });
export const getReports = () => apiRequest<{ reports: Report[] }>("/admin/reports");
export const getReport = (id: string) => apiRequest<{ report: Report }>(`/admin/reports/${id}`);
export const reviewReport = (id: string) => apiRequest<{ success: boolean }>(`/admin/reports/${id}/reviewing`, { method: "PATCH" });
export const resolveReport = (id: string, payload: { moderationNote: string; actionTaken: string }) => apiRequest<{ success: boolean }>(`/admin/reports/${id}/resolve`, { method: "PATCH", body: payload });
export const rejectReport = (id: string, payload: { moderationNote: string; actionTaken: string }) => apiRequest<{ success: boolean }>(`/admin/reports/${id}/reject`, { method: "PATCH", body: payload });
export const getProviderRequests = () => apiRequest<{ providerRequests: ProviderRequest[] }>("/admin/provider-requests");
export const getProviderRequest = (id: string) => apiRequest<{ providerRequest: ProviderRequest }>(`/admin/provider-requests/${id}`);
export const reviewProviderRequest = (id: string) => apiRequest<{ success: boolean }>(`/admin/provider-requests/${id}/reviewing`, { method: "PATCH" });
export const approveProviderRequest = (id: string) => apiRequest<{ success: boolean }>(`/admin/provider-requests/${id}/approve`, { method: "PATCH" });
export const rejectProviderRequest = (id: string) => apiRequest<{ success: boolean }>(`/admin/provider-requests/${id}/reject`, { method: "PATCH" });
export const getAdminLogs = (superadmin: boolean) => apiRequest<{ logs: AdminLog[] }>(superadmin ? "/admin/superadmin/logs?limit=300" : "/admin/logs?limit=300");
export const getAdminStats = (superadmin: boolean) => apiRequest<{ stats: AdminStats }>(superadmin ? "/admin/superadmin/stats" : "/admin/stats");
export const getTickets = () => apiRequest<{ tickets: AdminTicket[] }>("/admin/tickets");
export const getTicket = (id: string) => apiRequest<{ ticket: AdminTicket }>(`/admin/tickets/${id}`);
export const updateTicket = (id: string, payload: { status?: AdminTicket["status"]; priority?: AdminTicket["priority"]; assignToMe?: boolean }) => apiRequest<{ success: boolean }>(`/admin/tickets/${id}/status`, { method: "PATCH", body: payload });
export const replyTicket = (id: string, message: string) => apiRequest<{ success: boolean }>(`/admin/tickets/${id}/messages`, { method: "POST", body: { message } });
export const getCategories = () => apiRequest<{ categories: CategoryMap[] }>("/admin/superadmin/categories");
export const createCategory = (payload: { category: string; subcategory?: string }) => apiRequest<{ success: boolean }>("/admin/superadmin/categories", { method: "POST", body: payload });
export const renameCategory = (payload: { category: string; nextCategory: string; subcategory?: string; nextSubcategory?: string }) => apiRequest<{ success: boolean }>("/admin/superadmin/categories", { method: "PATCH", body: payload });
export const deleteCategory = (payload: { category: string; subcategory?: string }) => apiRequest<{ success: boolean }>("/admin/superadmin/categories", { method: "DELETE", body: payload });
