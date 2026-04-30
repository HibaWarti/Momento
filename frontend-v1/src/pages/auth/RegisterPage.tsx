import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export function RegisterPage() {
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
          <form className="grid gap-5 md:grid-cols-2">
            <Input label="First name" placeholder="Hiba" autoComplete="given-name" />

            <Input label="Last name" placeholder="Bennani" autoComplete="family-name" />

            <Input label="Username" placeholder="hiba_momento" autoComplete="username" />

            <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />

            <div className="md:col-span-2">
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="button" className="w-full">
                Create account
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