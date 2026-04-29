import { Link, NavLink } from 'react-router-dom'
import { Menu, Search, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { publicNavigation } from '../../constants/navigation'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-lg font-bold leading-none text-slate-950">Momento</p>
            <p className="text-xs text-slate-500">Memories & services</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {publicNavigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            <Search size={16} />
            Search
          </button>

          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>

          <Link to="/register">
            <Button>Join Momento</Button>
          </Link>
        </div>

        <button className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden">
          <Menu size={22} />
        </button>
      </nav>
    </header>
  )
}