import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'
import { paths } from '../../routes/paths'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await register({ firstName, lastName, username, email, password })
      navigate(paths.feed)
    } catch {
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-sm">
            <Sparkles size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Join Momento to share memories, follow people, and discover providers.
          </p>
        </div>

        <Card>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            {error && (
              <div className="md:col-span-2">
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
              </div>
            )}
            <Input
              label="First name"
              placeholder="Hiba"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Input
              label="Last name"
              placeholder="Bennani"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <Input
              label="Username"
              placeholder="hiba_momento"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="md:col-span-2">
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}