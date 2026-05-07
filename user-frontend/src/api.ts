const TOKEN_KEY = 'momento_token'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return 'http://localhost:3000'
  }
})()

type ApiRequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

export type ApiUser = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  profilePicturePath?: string | null
  bio?: string | null
  role: 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN'
  providerProfile?: {
    providerStatus?: 'ACTIVE' | 'SUSPENDED'
  } | null
  providerRequests?: Array<{
    status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED'
  }>
}

export type ApiPost = {
  id: string
  content: string
  author: ApiUser
  images: Array<{ id: string; imagePath: string }>
  reactions: Array<{ id: string; type: string; userId: string; postId?: string }>
  comments?: ApiComment[]
  _count?: {
    comments?: number
    reactions?: number
    reports?: number
  }
}

export type ApiComment = {
  id: string
  content: string
  parentId?: string | null
  user: ApiUser
  replies?: ApiComment[]
  reactions?: Array<{ id: string; type: string; userId: string; commentId?: string }>
}

export type ApiService = {
  id: string
  title: string
  description: string
  price?: number | null
  city?: string | null
  category: string
  subcategory?: string | null
  keywords: string[]
  images: Array<{ id: string; imagePath: string }>
  providerProfile: {
    providerStatus?: 'ACTIVE' | 'SUSPENDED'
    user: ApiUser
  }
  _count?: {
    reviews?: number
  }
}

export type ApiServiceImage = ApiService['images'][number]

export type ApiReview = {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  user: ApiUser
}

export type ApiChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender?: Pick<ApiUser, 'id' | 'firstName' | 'lastName' | 'username' | 'profilePicturePath'>
}

export type ApiConversation = {
  id: string
  createdAt: string
  updatedAt: string
  participants: Array<{
    id: string
    conversationId: string
    userId: string
    createdAt: string
    user: ApiUser
  }>
  messages: ApiChatMessage[]
  unreadCount?: number
  _count?: {
    messages?: number
  }
}

export type ApiNotification = {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export type SupportTicket = {
  id: string
  subject: string
  description: string
  category: 'ACCOUNT' | 'TECHNICAL' | 'REPORT' | 'PROVIDER' | 'OTHER'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  messages?: Array<{
    id: string
    message: string
    isStaff: boolean
    createdAt: string
  }>
}

export type ApiReport = {
  id: string
  reporterId: string
  reportedUserId?: string | null
  postId?: string | null
  commentId?: string | null
  serviceId?: string | null
  reason: string
  description?: string | null
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
  moderationNote?: string | null
  actionTaken?: string | null
  createdAt: string
  reporter?: ApiUser
  reportedUser?: ApiUser | null
  post?: ApiPost | null
  comment?: ApiComment | null
  service?: ApiService | null
}

export type AdminUserRow = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  role: 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN'
  accountStatus: 'ACTIVE' | 'BLOCKED' | 'DELETED'
  createdAt: string
  _count?: {
    posts?: number
    followers?: number
    following?: number
    providerRequests?: number
  }
}

export type AdminProviderRequest = {
  id: string
  professionalName: string
  professionalDescription: string
  phone: string
  city: string
  cinNumber: string
  cinPicturePath: string
  additionalInfo?: string | null
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  reviewedAt?: string | null
  user: ApiUser
}

export type AdminTicket = {
  id: string
  subject: string
  description: string
  category: 'ACCOUNT' | 'TECHNICAL' | 'REPORT' | 'PROVIDER' | 'OTHER'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  user?: ApiUser
  relatedUser?: ApiUser | null
  relatedPost?: ApiPost | null
  relatedComment?: ApiComment | null
  relatedService?: ApiService | null
  relatedReport?: ApiReport | null
  messages?: Array<{
    id: string
    message: string
    isStaff: boolean
    createdAt: string
  }>
}

export type AdminLog = {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  createdAt: string
  actor?: Pick<ApiUser, 'id' | 'firstName' | 'lastName' | 'username' | 'role'> | null
}

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  totalPosts: number
  activePosts: number
  hiddenPosts: number
  totalProviders: number
  activeProviders: number
  pendingProviderRequests: number
  totalServices: number
  activeServices: number
  hiddenServices: number
  totalReports: number
  pendingReports: number
  resolvedReports: number
  totalTickets: number
  openTickets: number
  totalReviews: number
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers()

  headers.set('Content-Type', 'application/json')

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed')
  }

  return data as T
}

async function apiUpload<T>(path: string, fieldName: string, files: File[]): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const formData = new FormData()

  files.forEach((file) => formData.append(fieldName, file))

  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Upload failed')
  }

  return data as T
}

export function getSupportTickets() {
  return apiRequest<{
    success: boolean
    message: string
    tickets: SupportTicket[]
  }>('/users/tickets')
}

export function createSupportTicket(payload: {
  subject: string
  description: string
  category: SupportTicket['category']
  priority: SupportTicket['priority']
}) {
  return apiRequest<{
    success: boolean
    message: string
    ticket: SupportTicket
  }>('/users/tickets', {
    method: 'POST',
    body: payload,
  })
}

export function uploadProviderCinPicture(file: File) {
  return apiUpload<{
    success: boolean
    message: string
    cinPicturePath: string
  }>('/providers/requests/cin-picture', 'cinPicture', [file])
}

export function createProviderRequest(payload: {
  professionalName: string
  professionalDescription: string
  phone: string
  city: string
  cinNumber: string
  cinPicturePath: string
  additionalInfo?: string
}) {
  return apiRequest<{
    success: boolean
    message: string
  }>('/providers/requests', {
    method: 'POST',
    body: payload,
  })
}

export function loginUser(payload: { email: string; password: string }) {
  return apiRequest<{
    success: boolean
    message: string
    user: ApiUser
    token: string
  }>('/auth/login', {
    method: 'POST',
    auth: false,
    body: payload,
  }).then((response) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    return response
  })
}

export function registerUser(payload: {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  requestedRole?: 'USER' | 'PROVIDER'
}) {
  return apiRequest<{
    success: boolean
    message: string
    user: ApiUser
    token: string
  }>('/auth/register', {
    method: 'POST',
    auth: false,
    body: payload,
  }).then((response) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    return response
  })
}

export function getCurrentUser() {
  return apiRequest<{
    success: boolean
    message: string
    user: ApiUser
  }>('/auth/me')
}

export function followUser(userId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/users/${userId}/follow`, {
    method: 'POST',
  })
}

export function unfollowUser(userId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/users/${userId}/follow`, {
    method: 'DELETE',
  })
}

export function getFollowing(userId: string) {
  return apiRequest<{
    success: boolean
    message: string
    following: ApiUser[]
    count: number
  }>(`/users/${userId}/following`)
}

export function getFollowers(userId: string) {
  return apiRequest<{
    success: boolean
    message: string
    followers: ApiUser[]
    count: number
  }>(`/users/${userId}/followers`)
}

export function getPosts() {
  return apiRequest<{
    success: boolean
    message: string
    posts: ApiPost[]
  }>('/posts', { auth: false })
}

export function createPost(payload: { content: string }) {
  return apiRequest<{
    success: boolean
    message: string
    post: ApiPost
  }>('/posts', {
    method: 'POST',
    body: payload,
  })
}

export function uploadPostImages(postId: string, files: File[]) {
  return apiUpload<{
    success: boolean
    message: string
    images: Array<{ id: string; imagePath: string }>
  }>(`/posts/${postId}/images`, 'images', files)
}

export function addPostComment(postId: string, content: string, parentId?: string) {
  return apiRequest<{
    success: boolean
    message: string
    comment: ApiComment
  }>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { content, parentId },
  })
}

export function updatePostComment(commentId: string, content: string) {
  return apiRequest<{
    success: boolean
    message: string
    comment: ApiComment
  }>(`/posts/comments/${commentId}`, {
    method: 'PATCH',
    body: { content },
  })
}

export function deletePostComment(commentId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export function reportPostComment(commentId: string, reason: string, description?: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/comments/${commentId}/reports`, {
    method: 'POST',
    body: { reason, description },
  })
}

export function likePostComment(commentId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/comments/${commentId}/reactions`, {
    method: 'POST',
    body: { type: 'LIKE' },
  })
}

export function unlikePostComment(commentId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/comments/${commentId}/reactions`, {
    method: 'DELETE',
  })
}

export function likePost(postId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/reactions`, {
    method: 'POST',
    body: { type: 'LIKE' },
  })
}

export function unlikePost(postId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/reactions`, {
    method: 'DELETE',
  })
}

export function savePost(postId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/save`, {
    method: 'POST',
  })
}

export function unsavePost(postId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/save`, {
    method: 'DELETE',
  })
}

export function reportPost(postId: string, reason: string, description?: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/reports`, {
    method: 'POST',
    body: { reason, description },
  })
}

export function reportUser(userId: string, reason: string, description?: string) {
  return apiRequest<{ success: boolean; message: string }>(`/users/${userId}/reports`, {
    method: 'POST',
    body: { reason, description },
  })
}

export function getAdminReports() {
  return apiRequest<{
    success: boolean
    message: string
    reports: ApiReport[]
  }>('/admin/reports')
}

export function getAdminUsers() {
  return apiRequest<{ success: boolean; message: string; users: AdminUserRow[] }>('/admin/users')
}

export function blockAdminUser(userId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/block`, { method: 'PATCH' })
}

export function unblockAdminUser(userId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/unblock`, { method: 'PATCH' })
}

export function promoteAdminBySuperadmin(userId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/superadmin/admins`, {
    method: 'POST',
    body: { userId },
  })
}

export function updateUserRoleBySuperadmin(userId: string, role: 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN') {
  return apiRequest<{ success: boolean; message: string }>(`/admin/superadmin/users/${userId}/role`, {
    method: 'PATCH',
    body: { role },
  })
}

export function deleteUserBySuperadmin(userId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/superadmin/users/${userId}`, { method: 'DELETE' })
}

export function getAdminProviderRequests() {
  return apiRequest<{ success: boolean; message: string; providerRequests: AdminProviderRequest[] }>('/admin/provider-requests')
}

export function getAdminProviderRequest(requestId: string) {
  return apiRequest<{ success: boolean; message: string; providerRequest: AdminProviderRequest }>(`/admin/provider-requests/${requestId}`)
}

export function reviewAdminProviderRequest(requestId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/provider-requests/${requestId}/reviewing`, { method: 'PATCH' })
}

export function approveAdminProviderRequest(requestId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/provider-requests/${requestId}/approve`, { method: 'PATCH' })
}

export function rejectAdminProviderRequest(requestId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/provider-requests/${requestId}/reject`, { method: 'PATCH' })
}

export function getAdminStats() {
  return apiRequest<{ success: boolean; message: string; stats: AdminStats }>('/admin/stats')
}

export function getSuperadminStats() {
  return apiRequest<{ success: boolean; message: string; stats: AdminStats }>('/admin/superadmin/stats')
}

export function getAdminLogs(limit = 100) {
  return apiRequest<{ success: boolean; message: string; logs: AdminLog[] }>(`/admin/logs?limit=${limit}`)
}

export function getSuperadminLogs(limit = 100) {
  return apiRequest<{ success: boolean; message: string; logs: AdminLog[] }>(`/admin/superadmin/logs?limit=${limit}`)
}

export function getAdminReport(reportId: string) {
  return apiRequest<{ success: boolean; message: string; report: ApiReport }>(`/admin/reports/${reportId}`)
}

export function markAdminReportReviewing(reportId: string) {
  return apiRequest<{ success: boolean; message: string; report: ApiReport }>(`/admin/reports/${reportId}/reviewing`, {
    method: 'PATCH',
  })
}

export function getAdminTickets() {
  return apiRequest<{ success: boolean; message: string; tickets: AdminTicket[] }>('/admin/tickets')
}

export function getAdminTicket(ticketId: string) {
  return apiRequest<{ success: boolean; message: string; ticket: AdminTicket }>(`/admin/tickets/${ticketId}`)
}

export function updateAdminTicketStatus(
  ticketId: string,
  payload: {
    status?: AdminTicket['status']
    priority?: AdminTicket['priority']
    assignToMe?: boolean
  },
) {
  return apiRequest<{ success: boolean; message: string; ticket: AdminTicket }>(`/admin/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: payload,
  })
}

export function replyAdminTicket(ticketId: string, message: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: { message },
  })
}

export function resolveAdminReport(reportId: string, payload: { moderationNote?: string; actionTaken?: string }) {
  return apiRequest<{ success: boolean; message: string; report: ApiReport }>(`/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
    body: payload,
  })
}

export function rejectAdminReport(reportId: string, payload: { moderationNote?: string; actionTaken?: string }) {
  return apiRequest<{ success: boolean; message: string; report: ApiReport }>(`/admin/reports/${reportId}/reject`, {
    method: 'PATCH',
    body: payload,
  })
}

export function getChatConversations() {
  return apiRequest<{
    success: boolean
    message: string
    conversations: ApiConversation[]
  }>('/chats/conversations')
}

export function createChatConversation(participantId: string) {
  return apiRequest<{
    success: boolean
    message: string
    conversation: ApiConversation
  }>('/chats/conversations', {
    method: 'POST',
    body: { participantId },
  })
}

export function getChatMessages(conversationId: string) {
  return apiRequest<{
    success: boolean
    message: string
    messages: ApiChatMessage[]
  }>(`/chats/conversations/${conversationId}/messages`)
}

export function sendChatMessage(conversationId: string, content: string) {
  return apiRequest<{
    success: boolean
    message: string
    chatMessage: ApiChatMessage
  }>(`/chats/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content },
  })
}

export function markChatConversationRead(conversationId: string) {
  return apiRequest<{
    success: boolean
    message: string
    updatedCount: number
  }>(`/chats/conversations/${conversationId}/read`, {
    method: 'PATCH',
  })
}

export function getNotifications() {
  return apiRequest<{
    success: boolean
    message: string
    notifications: ApiNotification[]
  }>('/notifications')
}

export function markNotificationAsRead(notificationId: string) {
  return apiRequest<{
    success: boolean
    message: string
    notification: ApiNotification
  }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
}

export function getServices() {
  return apiRequest<{
    success: boolean
    message: string
    services: ApiService[]
  }>('/providers/services', { auth: false })
}

export function createProviderService(payload: {
  title: string
  description: string
  category: string
  subcategory?: string
  keywords: string[]
  city?: string
  price?: number | null
}) {
  return apiRequest<{
    success: boolean
    message: string
    service: ApiService
  }>('/providers/services', {
    method: 'POST',
    body: payload,
  })
}

export function updateProviderService(serviceId: string, payload: {
  title?: string
  description?: string
  category?: string
  subcategory?: string | null
  keywords?: string[]
  city?: string
  price?: number | null
}) {
  return apiRequest<{
    success: boolean
    message: string
    service: ApiService
  }>(`/providers/services/${serviceId}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteProviderService(serviceId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/providers/services/${serviceId}`, {
    method: 'DELETE',
  })
}

export function getServiceReviews(serviceId: string) {
  return apiRequest<{
    success: boolean
    message: string
    reviews: ApiReview[]
  }>(`/providers/services/${serviceId}/reviews`, { auth: false })
}

export function createServiceReview(serviceId: string, payload: { rating: number; comment?: string }) {
  return apiRequest<{
    success: boolean
    message: string
    review: ApiReview
  }>(`/providers/services/${serviceId}/reviews`, {
    method: 'POST',
    body: payload,
  })
}

export function uploadServiceImages(serviceId: string, files: File[]) {
  return apiUpload<{
    success: boolean
    message: string
    images: Array<{ id: string; imagePath: string }>
  }>(`/providers/services/${serviceId}/images`, 'images', files)
}

export function setServiceCoverImage(serviceId: string, imageId: string) {
  return apiRequest<{
    success: boolean
    message: string
    images: ApiServiceImage[]
  }>(`/providers/services/${serviceId}/images/${imageId}/cover`, {
    method: 'PATCH',
  })
}

export function deleteServiceImage(serviceId: string, imageId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/providers/services/${serviceId}/images/${imageId}`, {
    method: 'DELETE',
  })
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}
