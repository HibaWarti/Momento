import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { publicNavigation } from '../../constants/navigation'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { paths } from '../../routes/paths'
import { getAssetUrl } from '../../api/client'
import { getUnreadNotificationsCount } from '../../api/notificationApi'
import { getConversations } from '../../api/chatApi'
import { createChatSocket, createNotificationSocket } from '../../api/realtime'

const authLinks = [
  { label: 'Feed', href: paths.feed },
]

export function Navbar() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const { currentTheme, setTheme, theme } = useThemeStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)

  const avatarUrl = getAssetUrl(user?.profilePicturePath)
  const initials = useMemo(() => {
    if (!user) return 'MO'
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'MO'
  }, [user])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setUnreadCount(0)
      return
    }

    let isActive = true

    getUnreadNotificationsCount()
      .then((response) => {
        if (isActive) {
          setUnreadCount(response.unreadCount)
        }
      })
      .catch(() => {
        if (isActive) {
          setUnreadCount(0)
        }
      })

    const notificationSocket = createNotificationSocket({ token })

    notificationSocket.on('notification:unread-count', ({ unreadCount }) => {
      setUnreadCount(unreadCount)
    })

    return () => {
      isActive = false
      notificationSocket.disconnect()
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setUnreadMessagesCount(0)
      return
    }

    let isActive = true

    const loadUnreadMessages = async () => {
      try {
        const response = await getConversations()
        if (isActive) {
          setUnreadMessagesCount(
            response.conversations.reduce(
              (total, conversation) => total + (conversation.unreadCount ?? 0),
              0,
            ),
          )
        }
      } catch {
        if (isActive) {
          setUnreadMessagesCount(0)
        }
      }
    }

    void loadUnreadMessages()

    const chatSocket = createChatSocket({ token })
    chatSocket.on('conversation:updated', () => {
      void loadUnreadMessages()
    })

    return () => {
      isActive = false
      chatSocket.disconnect()
    }
  }, [isAuthenticated, token])

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    setIsMenuOpen(false)
    logout()
    navigate(paths.home)
  }

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-[var(--theme-primary)] text-white'
        : 'text-[var(--theme-muted)] hover:bg-[var(--theme-card)] hover:text-[var(--theme-foreground)]'
    }`

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: `${theme.colors.background}e6`,
        borderColor: theme.colors.border,
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={paths.home} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white">
            <Sparkles size={18} />
          </span>
          <span className="text-xl font-bold text-[var(--theme-foreground)]">Momento</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {publicNavigation
            .filter((item) => item.href !== paths.home)
            .map((item) => (
              <NavLink key={item.href} to={item.href} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

          {isAuthenticated &&
            authLinks.map((item) => (
              <NavLink key={item.href} to={item.href} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') ? (
            <NavLink to={paths.admin} className={navLinkClass}>
              Admin
            </NavLink>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-card)] text-[var(--theme-foreground)] transition hover:border-[var(--theme-primary)]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to={paths.notifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-card)] text-[var(--theme-foreground)]"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--theme-error)] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to={paths.chats}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-card)] text-[var(--theme-foreground)] md:flex"
                aria-label="Messages"
                title="Messages"
              >
                <MessageCircle size={18} />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--theme-primary)] px-1 text-[10px] font-bold text-white">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </Link>

              <Link
                to={paths.settings}
                className="hidden h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-card)] text-[var(--theme-foreground)] md:flex"
                aria-label="Settings"
                title="Settings"
              >
                <Settings size={18} />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--theme-card)] bg-[var(--theme-primary)] text-sm font-bold text-white shadow-sm"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  aria-label="Open user menu"
                  title="Open user menu"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-lg">
                    <div className="border-b border-[var(--theme-border)] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[var(--theme-foreground)]">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="truncate text-xs text-[var(--theme-muted)]">@{user?.username}</p>
                    </div>

                    <Link
                      to={paths.profile}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--theme-foreground)] hover:bg-[var(--theme-background)]"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[var(--theme-error)] hover:bg-[var(--theme-background)]"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to={paths.login}>
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to={paths.register}>
                <Button>Sign up</Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-foreground)] lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-[var(--theme-border)] bg-[var(--theme-card)] px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {[
              ...publicNavigation,
              ...(isAuthenticated
                ? [
                    ...authLinks,
                    { label: 'Messages', href: paths.chats },
                    { label: 'Notifications', href: paths.notifications },
                  ]
                : []),
            ].map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={navLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <NavLink
                  to={paths.settings}
                  className={navLinkClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--theme-error)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid gap-2 pt-2">
                <Link to={paths.login} onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to={paths.register} onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
