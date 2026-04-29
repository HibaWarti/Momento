import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export function ProvidersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge variant="pink">Providers</Badge>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Discover providers</h1>
      <p className="mt-2 text-slate-600">
        Browse professional profiles and services offered by approved providers.
      </p>

      <Card className="mt-8">
        <p className="text-slate-600">Providers page placeholder.</p>
      </Card>
    </main>
  )
}