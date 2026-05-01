import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Search, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { publicNavigation } from '../../constants/navigation'
import { useAuthStore } from '../../store/authStore'
import { paths } from '../../routes/paths'

export function Navbar() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate(paths.home)
  }

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
          {isAuthenticated && (
            <>
              <NavLink
                to={paths.feed}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                Feed
              </NavLink>
              <NavLink
                to={paths.profile}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                Profile
              </NavLink>
              <NavLink
                to={paths.notifications}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                Notifications
              </NavLink>
              <NavLink
                to={paths.chats}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                Messages
              </NavLink>
              {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
                <NavLink
                  to={paths.admin}
                  className={({ isActive }) =>
                    `text-sm font-medium transition ${
                      isActive ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950'
                    }`
                  }
                >
                  Admin
                </NavLink>
              ) : null}
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            <Search size={16} />
            Search
          </button>

          {!isAuthenticated ? (
            <>
              <Link to={paths.login}>
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to={paths.register}>
                <Button>Join Momento</Button>
              </Link>
            </>
          ) : (
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>

        <button className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden">
          <Menu size={22} />
        </button>
      </nav>
    </header>
  )
}
