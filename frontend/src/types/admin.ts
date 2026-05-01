import type { AuthUser } from './auth'
import type { Post } from './post'
import type { Service } from './provider'

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'

export type AdminStats = {
  totalUsers?: number
  activeUsers?: number
  blockedUsers?: number
  totalPosts?: number
  activePosts?: number
  hiddenPosts?: number
  totalProviders?: number
  activeProviders?: number
  pendingProviderRequests?: number
  totalServices?: number
  activeServices?: number
  hiddenServices?: number
  totalReports?: number
  pendingReports?: number
  resolvedReports?: number
  totalReviews?: number
  totalNotifications?: number
}

export type AdminReport = {
  id: string
  reporterId: string
  reportedUserId?: string | null
  postId?: string | null
  serviceId?: string | null
  reason: string
  description?: string | null
  status: ReportStatus
  createdAt?: string
  updatedAt?: string
  reviewedAt?: string | null
  reporter?: AuthUser
  reportedUser?: AuthUser | null
  post?: Post | null
  service?: Service | null
}

export type AdminLog = {
  id: string
  actorId?: string | null
  action: string
  entityType?: string | null
  entityId?: string | null
  description?: string | null
  createdAt: string
  actor?: AuthUser | null
}
