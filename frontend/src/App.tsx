import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/layout/PublicLayout'
import { HomePage } from './pages/public/HomePage'
import { ExplorePage } from './pages/public/ExplorePage'
import { ServicesPage } from './pages/services/ServicesPage'
import { ProvidersPage } from './pages/providers/ProvidersPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App