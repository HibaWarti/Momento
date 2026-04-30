import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function NotFoundPage() {
  return (
    <main className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-12">
      <Card className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
          <SearchX size={30} />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
          404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link to="/">
          <Button className="mt-6">
            <ArrowLeft className="mr-2 inline" size={16} />
            Back to home
          </Button>
        </Link>
      </Card>
    </main>
  )
}