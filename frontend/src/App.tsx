import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProviderRequestsPage } from './pages/admin/AdminProviderRequestsPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { paths } from './routes/paths'

function App() {
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
          <Route path={paths.providerRequest} element={<ProviderRequestPage />} />
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.register} element={<RegisterPage />} />
          <Route path={paths.feed} element={<FeedPage />} />
          <Route path={paths.profile} element={<ProfilePage />} />
          <Route path={paths.notifications} element={<NotificationsPage />} />
          <Route path={paths.adminDashboard} element={<AdminDashboardPage />} />
          <Route path={paths.adminProviderRequests} element={<AdminProviderRequestsPage />} />
          <Route path={paths.adminReports} element={<AdminReportsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App