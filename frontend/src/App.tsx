import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { PublicLayout } from './components/layout/PublicLayout'
import { HomePage } from './pages/public/HomePage'
import { ExplorePage } from './pages/public/ExplorePage'
import { ServicesPage } from './pages/services/ServicesPage'
import { ProvidersPage } from './pages/providers/ProvidersPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { FeedPage } from './pages/feed/FeedPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { ServiceDetailsPage } from './pages/services/ServiceDetailsPage'
import { ProviderProfilePage } from './pages/providers/ProviderProfilePage'
import { ProviderRequestPage } from './pages/providers/ProviderRequestPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { ChatsPage } from './pages/chat/ChatsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminProviderRequestsPage } from './pages/admin/AdminProviderRequestsPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { paths } from './routes/paths'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import { useAuthStore } from './store/authStore'

function App() {
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={paths.home} element={<HomePage />} />
          <Route path={paths.explore} element={<ExplorePage />} />
          <Route path={paths.services} element={<ServicesPage />} />
          <Route path={paths.serviceDetails} element={<ServiceDetailsPage />} />
          <Route path={paths.providers} element={<ProvidersPage />} />
          <Route path={paths.providerProfile} element={<ProviderProfilePage />} />
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.register} element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path={paths.feed} element={<FeedPage />} />
            <Route path={paths.profile} element={<ProfilePage />} />
            <Route path={paths.notifications} element={<NotificationsPage />} />
            <Route path={paths.chats} element={<ChatsPage />} />
            <Route path={paths.chatConversation} element={<ChatsPage />} />
            <Route path={paths.providerRequest} element={<ProviderRequestPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path={paths.admin} element={<AdminDashboardPage />} />
            <Route path={paths.adminUsers} element={<AdminUsersPage />} />
            <Route path={paths.adminProviderRequests} element={<AdminProviderRequestsPage />} />
            <Route path={paths.adminReports} element={<AdminReportsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
