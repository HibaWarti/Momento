import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'
import { paths } from '../../routes/paths'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate(paths.feed)
    } catch {
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-sm">
            <Sparkles size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in to continue sharing memories and discovering services.
          </p>
        </div>

        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                Remember me
              </label>

              <button type="button" className="font-medium text-orange-600 hover:text-orange-700">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}