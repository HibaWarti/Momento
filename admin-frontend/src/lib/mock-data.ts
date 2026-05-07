// Mock data backing the admin backoffice. Replace with real API calls later.
// Each domain has a "// === REAL API ===" comment showing the endpoint to hit.

export type ReportTarget = "POST" | "USER" | "SERVICE" | "COMMENT";
export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";
export type ProviderRequestStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED";

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "USER" | "PROVIDER" | "ADMIN" | "SUPERADMIN";
  accountStatus: "ACTIVE" | "BLOCKED" | "DELETED";
  createdAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  reportsAgainstCount: number;
  bio?: string;
}

export interface MockPost {
  id: string;
  authorId: string;
  caption: string;
  createdAt: string;
  imageCount: number;
  likes: number;
  commentsCount: number;
  status: "ACTIVE" | "HIDDEN" | "DELETED";
}

export interface MockComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  status: "VISIBLE" | "HIDDEN" | "DELETED";
}

export interface MockService {
  id: string;
  providerId: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  status: "ACTIVE" | "HIDDEN" | "DELETED";
  reviewsCount: number;
  averageRating: number;
}

export interface MockReport {
  id: string;
  target: ReportTarget;
  targetId: string;
  reason: string;
  details: string;
  reporterId: string;
  status: ReportStatus;
  createdAt: string;
  reviewedBy?: string;
}

export interface MockProviderRequest {
  id: string;
  userId: string;
  status: ProviderRequestStatus;
  createdAt: string;
  // Personal
  fullName: string;
  phone: string;
  address: string;
  // Professional
  businessName: string;
  category: string;
  yearsExperience: number;
  description: string;
  // Identity
  cinNumber: string;
  cinPicturePath: string;
  reviewedBy?: string;
}

export interface MockAdminLog {
  id: string;
  adminId: string;
  action:
    | "USER_BLOCKED"
    | "USER_UNBLOCKED"
    | "POST_HIDDEN"
    | "COMMENT_HIDDEN"
    | "PROVIDER_REQUEST_APPROVED"
    | "PROVIDER_REQUEST_REJECTED"
    | "REPORT_REVIEWED"
    | "SERVICE_HIDDEN"
    | "USER_CREATED";
  targetType: string;
  targetId: string;
  note?: string;
  createdAt: string;
}

// ----- seed data -----

export const mockUsers: MockUser[] = [
  { id: "u1", firstName: "Sara", lastName: "Mansouri", username: "sara.m", email: "sara@example.com", role: "USER", accountStatus: "ACTIVE", createdAt: "2026-01-12T10:24:00Z", postsCount: 34, followersCount: 412, followingCount: 188, reportsAgainstCount: 0, bio: "Memory keeper ✨" },
  { id: "u2", firstName: "Youssef", lastName: "Alami", username: "yalami", email: "yalami@example.com", role: "USER", accountStatus: "ACTIVE", createdAt: "2025-11-03T09:00:00Z", postsCount: 12, followersCount: 88, followingCount: 140, reportsAgainstCount: 3, bio: "Travel & coffee." },
  { id: "u3", firstName: "Imane", lastName: "Bouzidi", username: "imane.b", email: "imane@example.com", role: "PROVIDER", accountStatus: "ACTIVE", createdAt: "2025-08-22T14:00:00Z", postsCount: 56, followersCount: 1820, followingCount: 230, reportsAgainstCount: 1, bio: "Wedding planner." },
  { id: "u4", firstName: "Mehdi", lastName: "Tazi", username: "mehdi", email: "mehdi@example.com", role: "USER", accountStatus: "BLOCKED", createdAt: "2026-02-18T18:42:00Z", postsCount: 4, followersCount: 7, followingCount: 11, reportsAgainstCount: 8 },
  { id: "u5", firstName: "Lina", lastName: "Saadi", username: "lina", email: "lina@example.com", role: "USER", accountStatus: "ACTIVE", createdAt: "2026-03-01T08:10:00Z", postsCount: 21, followersCount: 305, followingCount: 142, reportsAgainstCount: 0 },
  { id: "u6", firstName: "Omar", lastName: "Cherkaoui", username: "omar.c", email: "omar@example.com", role: "USER", accountStatus: "ACTIVE", createdAt: "2026-04-04T11:55:00Z", postsCount: 2, followersCount: 12, followingCount: 30, reportsAgainstCount: 5 },
  { id: "u7", firstName: "Nadia", lastName: "Benali", username: "nadia.b", email: "nadia@example.com", role: "PROVIDER", accountStatus: "ACTIVE", createdAt: "2025-12-20T16:30:00Z", postsCount: 78, followersCount: 2200, followingCount: 410, reportsAgainstCount: 0, bio: "Photographer." },
  { id: "u8", firstName: "Hamza", lastName: "Rachidi", username: "hamza", email: "hamza@example.com", role: "USER", accountStatus: "ACTIVE", createdAt: "2026-04-21T07:15:00Z", postsCount: 9, followersCount: 44, followingCount: 60, reportsAgainstCount: 1 },
];

export const mockPosts: MockPost[] = [
  { id: "p1", authorId: "u2", caption: "Sunset over Essaouira 🌅", createdAt: "2026-04-22T20:14:00Z", imageCount: 3, likes: 124, commentsCount: 18, status: "ACTIVE" },
  { id: "p2", authorId: "u4", caption: "Buy followers cheap, DM me!! 🚀🚀", createdAt: "2026-04-29T13:02:00Z", imageCount: 1, likes: 2, commentsCount: 1, status: "ACTIVE" },
  { id: "p3", authorId: "u6", caption: "Inappropriate content here", createdAt: "2026-04-30T19:50:00Z", imageCount: 2, likes: 8, commentsCount: 4, status: "ACTIVE" },
];

export const mockComments: MockComment[] = [
  { id: "c1", postId: "p1", authorId: "u4", content: "this is trash, learn photography", createdAt: "2026-04-22T21:00:00Z", status: "VISIBLE" },
  { id: "c2", postId: "p1", authorId: "u6", content: "Spam link: http://sketchy.example", createdAt: "2026-04-23T09:11:00Z", status: "VISIBLE" },
];

export const mockServices: MockService[] = [
  { id: "s1", providerId: "u3", title: "Wedding planning - full day", category: "Events", subcategory: "Weddings", description: "Full coordination on your big day.", price: 8500, status: "ACTIVE", reviewsCount: 42, averageRating: 4.8 },
  { id: "s2", providerId: "u7", title: "Engagement photoshoot", category: "Photography", subcategory: "Couples", description: "2h outdoor shoot, 40 edited photos.", price: 1500, status: "ACTIVE", reviewsCount: 17, averageRating: 4.6 },
  { id: "s3", providerId: "u3", title: "Suspicious cheap deal", category: "Events", subcategory: "Other", description: "Click my external link.", price: 10, status: "ACTIVE", reviewsCount: 1, averageRating: 2.0 },
];

export const mockReports: MockReport[] = [
  { id: "r1", target: "POST", targetId: "p2", reason: "Spam / scam", details: "User is selling fake followers in caption.", reporterId: "u1", status: "PENDING", createdAt: "2026-04-29T14:00:00Z" },
  { id: "r2", target: "USER", targetId: "u4", reason: "Repeated harassment", details: "Has been harassing multiple users in comments.", reporterId: "u5", status: "PENDING", createdAt: "2026-04-30T08:22:00Z" },
  { id: "r3", target: "COMMENT", targetId: "c2", reason: "Spam link", details: "Comment posts external sketchy link.", reporterId: "u1", status: "REVIEWING", createdAt: "2026-04-28T18:00:00Z" },
  { id: "r4", target: "SERVICE", targetId: "s3", reason: "Misleading offer", details: "Price seems fake; redirects offsite.", reporterId: "u8", status: "PENDING", createdAt: "2026-05-01T10:30:00Z" },
  { id: "r5", target: "POST", targetId: "p3", reason: "Inappropriate content", details: "Contains explicit material.", reporterId: "u5", status: "PENDING", createdAt: "2026-05-02T22:11:00Z" },
  { id: "r6", target: "COMMENT", targetId: "c1", reason: "Hate speech", details: "Insulting the author.", reporterId: "u1", status: "RESOLVED", createdAt: "2026-04-23T10:00:00Z" },
];

export const mockProviderRequests: MockProviderRequest[] = [
  {
    id: "pr1", userId: "u5", status: "PENDING", createdAt: "2026-04-28T11:00:00Z",
    fullName: "Lina Saadi", phone: "+212 6 12 34 56 78", address: "12 Rue Atlas, Casablanca",
    businessName: "Lina Floral Studio", category: "Florist", yearsExperience: 4,
    description: "Floral arrangements for weddings, birthdays and corporate events.",
    cinNumber: "BK839201", cinPicturePath: "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=600",
  },
  {
    id: "pr2", userId: "u8", status: "PENDING", createdAt: "2026-05-01T09:30:00Z",
    fullName: "Hamza Rachidi", phone: "+212 6 78 11 22 33", address: "Av. Hassan II, Rabat",
    businessName: "Hamza DJ", category: "Entertainment", yearsExperience: 6,
    description: "Mobile DJ service for weddings and private parties.",
    cinNumber: "AA112233", cinPicturePath: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600",
  },
  {
    id: "pr3", userId: "u2", status: "REVIEWING", createdAt: "2026-04-20T15:00:00Z",
    fullName: "Youssef Alami", phone: "+212 6 99 88 77 66", address: "Marrakech",
    businessName: "Y. Catering", category: "Catering", yearsExperience: 2,
    description: "Traditional Moroccan catering for events up to 100 guests.",
    cinNumber: "ZZ778899", cinPicturePath: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
  },
];

export const mockAdminLogs: MockAdminLog[] = [
  { id: "l1", adminId: "u-admin-1", action: "USER_BLOCKED", targetType: "USER", targetId: "u4", note: "Repeated harassment.", createdAt: "2026-04-30T09:14:00Z" },
  { id: "l2", adminId: "u-admin-1", action: "POST_HIDDEN", targetType: "POST", targetId: "p3", note: "NSFW content.", createdAt: "2026-05-02T22:30:00Z" },
  { id: "l3", adminId: "u-admin-1", action: "PROVIDER_REQUEST_APPROVED", targetType: "PROVIDER_REQUEST", targetId: "pr3", createdAt: "2026-04-22T10:00:00Z" },
  { id: "l4", adminId: "u-admin-1", action: "REPORT_REVIEWED", targetType: "REPORT", targetId: "r6", note: "Resolved as valid.", createdAt: "2026-04-23T11:00:00Z" },
  { id: "l5", adminId: "u-admin-1", action: "COMMENT_HIDDEN", targetType: "COMMENT", targetId: "c2", createdAt: "2026-04-29T08:45:00Z" },
];

// helpers
export const findUser = (id: string) => mockUsers.find((u) => u.id === id);
export const findPost = (id: string) => mockPosts.find((p) => p.id === id);
export const findComment = (id: string) => mockComments.find((c) => c.id === id);
export const findService = (id: string) => mockServices.find((s) => s.id === id);
export const findRequest = (id: string) => mockProviderRequests.find((r) => r.id === id);

// ----- chart series -----
export const reportsLast7Days = [
  { day: "Mon", reports: 6 },
  { day: "Tue", reports: 9 },
  { day: "Wed", reports: 4 },
  { day: "Thu", reports: 12 },
  { day: "Fri", reports: 7 },
  { day: "Sat", reports: 15 },
  { day: "Sun", reports: 10 },
];

export const reportsByType = [
  { type: "Posts", value: 28 },
  { type: "Users", value: 14 },
  { type: "Comments", value: 22 },
  { type: "Services", value: 9 },
];

export const usersGrowth = [
  { month: "Nov", users: 1240, providers: 110 },
  { month: "Dec", users: 1480, providers: 132 },
  { month: "Jan", users: 1810, providers: 158 },
  { month: "Feb", users: 2120, providers: 184 },
  { month: "Mar", users: 2540, providers: 215 },
  { month: "Apr", users: 3010, providers: 244 },
];

export const contentBreakdown = [
  { name: "Posts", value: 4820 },
  { name: "Comments", value: 18430 },
  { name: "Services", value: 612 },
  { name: "Reviews", value: 2104 },
];

export const adminActivity = [
  { day: "Mon", actions: 12 },
  { day: "Tue", actions: 18 },
  { day: "Wed", actions: 9 },
  { day: "Thu", actions: 22 },
  { day: "Fri", actions: 14 },
  { day: "Sat", actions: 6 },
  { day: "Sun", actions: 4 },
];
