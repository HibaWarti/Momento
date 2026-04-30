import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-orange-50 text-slate-950">
      <Navbar />
      <Outlet />
    </div>
  )
}