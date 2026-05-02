import { Bell, Check, ChevronRight, Lock, LogOut, Moon, Palette, Shield, Sun, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { themes } from '../../constants/themes'
import { paths } from '../../routes/paths'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { getAssetUrl } from '../../api/client'

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'privacy'

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { currentTheme, setTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')

  const avatarUrl = getAssetUrl(user?.profilePicturePath)
  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'MO'
    : 'MO'

  const handleLogout = () => {
    logout()
    navigate(paths.home)
  }

  const renderContent = () => {
    if (activeTab === 'profile') {
      return (
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--theme-primary)] text-lg font-bold text-white">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--theme-foreground)]">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-[var(--theme-muted)]">@{user?.username}</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-[var(--theme-border)] rounded-lg border border-[var(--theme-border)]">
            <Link
              to={paths.profile}
              className="flex items-center justify-between px-4 py-4 text-sm font-medium text-[var(--theme-foreground)] hover:bg-[var(--theme-background)]"
            >
              <span className="flex items-center gap-3">
                <User size={18} />
                Edit profile details
              </span>
              <ChevronRight size={16} />
            </Link>
            <Link
              to={paths.providerRequest}
              className="flex items-center justify-between px-4 py-4 text-sm font-medium text-[var(--theme-foreground)] hover:bg-[var(--theme-background)]"
            >
              <span className="flex items-center gap-3">
                <Palette size={18} />
                Become a provider
              </span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )
    }

    if (activeTab === 'appearance') {
      return (
        <div>
          <h2 className="text-xl font-semibold text-[var(--theme-foreground)]">Appearance</h2>
          <p className="mt-2 text-sm text-[var(--theme-muted)]">
            Choose the mood that fits the way you want Momento to feel.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(themes).map(([themeKey, themeOption]) => {
              const isSelected = currentTheme === themeKey
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setTheme(themeKey)}
                  className="relative rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundColor: themeOption.colors.card,
                    borderColor: isSelected ? themeOption.colors.primary : themeOption.colors.border,
                    color: themeOption.colors.foreground,
                  }}
                >
                  {isSelected && (
                    <span
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: themeOption.colors.primary }}
                    >
                      <Check size={14} />
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {themeKey === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="font-semibold">{themeOption.name}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-1">
                    {[
                      themeOption.colors.primary,
                      themeOption.colors.secondary,
                      themeOption.colors.accent,
                      themeOption.colors.background,
                      themeOption.colors.foreground,
                    ].map((color) => (
                      <span
                        key={color}
                        className="h-7 rounded-md border"
                        style={{ backgroundColor: color, borderColor: themeOption.colors.border }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (activeTab === 'notifications') {
      return (
        <div>
          <h2 className="text-xl font-semibold text-[var(--theme-foreground)]">Notifications</h2>
          <div className="mt-6 space-y-3">
            {[
              ['Realtime alerts', 'Show new likes, comments, follows, and system alerts as they arrive.'],
              ['Message alerts', 'Highlight unread conversations in the navbar.'],
              ['Provider updates', 'Notify me when provider requests change status.'],
            ].map(([title, description], index) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-lg border border-[var(--theme-border)] p-4"
              >
                <div>
                  <p className="font-medium text-[var(--theme-foreground)]">{title}</p>
                  <p className="mt-1 text-sm text-[var(--theme-muted)]">{description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked={index !== 2} />
                  <span className="h-6 w-11 rounded-full bg-[var(--theme-border)] transition peer-checked:bg-[var(--theme-primary)]" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div>
        <h2 className="text-xl font-semibold text-[var(--theme-foreground)]">Privacy & Security</h2>
        <div className="mt-6 divide-y divide-[var(--theme-border)] rounded-lg border border-[var(--theme-border)]">
          {([
            ['Privacy', 'Control who can see your profile and posts.', Lock],
            ['Account status', `Your account is currently ${user?.accountStatus ?? 'active'}.`, Shield],
            ['Login activity', 'Review recent sessions and devices.', User],
          ] as Array<[string, string, typeof User]>).map(([title, description, Icon]) => (
            <div key={String(title)} className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Icon className="text-[var(--theme-muted)]" size={18} />
                <div>
                  <p className="text-sm font-medium text-[var(--theme-foreground)]">{title}</p>
                  <p className="text-sm text-[var(--theme-muted)]">{description}</p>
                </div>
              </div>
              <ChevronRight className="text-[var(--theme-muted)]" size={16} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--theme-foreground)]">Settings</h1>
        {user && (
          <p className="mt-2 text-sm text-[var(--theme-muted)]">
            Signed in as {user.firstName} {user.lastName} ({user.email})
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-[var(--theme-primary)] text-white'
                    : 'text-[var(--theme-foreground)] hover:bg-[var(--theme-background)]'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card>{renderContent()}</Card>
      </div>

      <div className="mt-6">
        <Button
          variant="ghost"
          className="text-[var(--theme-error)]"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 inline h-5 w-5" />
          Log out
        </Button>
      </div>
    </main>
  )
}
