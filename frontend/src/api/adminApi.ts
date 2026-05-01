import { apiRequest } from './client'
import type { AdminStats, AdminReport, AdminLog } from '../types/admin'
import type { AuthUser } from '../types/auth'
import type { ProviderRequest } from '../types/provider'

type StatsResponse = {
  success: boolean
  message: string
  stats: AdminStats
}

type UsersResponse = {
  success: boolean
  message: string
  users: AuthUser[]
}

type UserResponse = {
  success: boolean
  message: string
  user: AuthUser
}

type ProviderRequestsResponse = {
  success: boolean
  message: string
  providerRequests: ProviderRequest[]
}

type ProviderRequestResponse = {
  success: boolean
  message: string
  providerRequest: ProviderRequest
}

type ReportsResponse = {
  success: boolean
  message: string
  reports: AdminReport[]
}

type ReportResponse = {
  success: boolean
  message: string
  report: AdminReport
}

type LogsResponse = {
  success: boolean
  message: string
  logs: AdminLog[]
}

export function getAdminStats() {
  return apiRequest<StatsResponse>('/admin/stats')
}

export function getAdminLogs() {
  return apiRequest<LogsResponse>('/admin/logs')
}

export function getUsers() {
  return apiRequest<UsersResponse>('/admin/users')
}

export function getUserById(id: string) {
  return apiRequest<UserResponse>(`/admin/users/${id}`)
}

export function blockUser(id: string) {
  return apiRequest<UserResponse>(`/admin/users/${id}/block`, { method: 'PATCH' })
}

export function unblockUser(id: string) {
  return apiRequest<UserResponse>(`/admin/users/${id}/unblock`, { method: 'PATCH' })
}

export function getProviderRequests(status?: string) {
  const url = status ? `/admin/provider-requests?status=${status}` : '/admin/provider-requests'
  return apiRequest<ProviderRequestsResponse>(url)
}

export function getProviderRequestById(id: string) {
  return apiRequest<ProviderRequestResponse>(`/admin/provider-requests/${id}`)
}

export function markProviderRequestReviewing(id: string) {
  return apiRequest<ProviderRequestResponse>(`/admin/provider-requests/${id}/reviewing`, { method: 'PATCH' })
}

export function approveProviderRequest(id: string) {
  return apiRequest<ProviderRequestResponse>(`/admin/provider-requests/${id}/approve`, { method: 'PATCH' })
}

export function rejectProviderRequest(id: string, reason?: string) {
  return apiRequest<ProviderRequestResponse>(`/admin/provider-requests/${id}/reject`, {
    method: 'PATCH',
    body: reason ? { reason } : undefined,
  })
}

export function getReports() {
  return apiRequest<ReportsResponse>('/admin/reports')
}

export function getReportById(id: string) {
  return apiRequest<ReportResponse>(`/admin/reports/${id}`)
}

export function markReportReviewing(id: string) {
  return apiRequest<ReportResponse>(`/admin/reports/${id}/reviewing`, { method: 'PATCH' })
}

export function resolveReport(id: string) {
  return apiRequest<ReportResponse>(`/admin/reports/${id}/resolve`, { method: 'PATCH' })
}

export function rejectReport(id: string) {
  return apiRequest<ReportResponse>(`/admin/reports/${id}/reject`, { method: 'PATCH' })
}

export function hidePost(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/posts/${id}/hide`, { method: 'PATCH' })
}

export function restorePost(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/posts/${id}/restore`, { method: 'PATCH' })
}

export function hideService(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/services/${id}/hide`, { method: 'PATCH' })
}

export function restoreService(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/services/${id}/restore`, { method: 'PATCH' })
}

export function hideReview(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/reviews/${id}/hide`, { method: 'PATCH' })
}

export function restoreReview(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/reviews/${id}/restore`, { method: 'PATCH' })
}

export function getSuperAdminLogs() {
  return apiRequest<LogsResponse>('/admin/superadmin/logs')
}

export function getSuperAdminStats() {
  return apiRequest<StatsResponse>('/admin/superadmin/stats')
}
