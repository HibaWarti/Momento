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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App