import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { getProviders } from '../../api/providerApi'
import type { ProviderProfile } from '../../types/provider'

export function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProviders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getProviders()
      setProviders(response.providers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [])

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
          <p className="mt-4 text-slate-600">Loading providers...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error}</p>
          <Button className="mt-4" onClick={loadProviders}>Try again</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge variant="pink">Providers</Badge>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Discover providers</h1>
      <p className="mt-2 text-slate-600">
        Browse professional profiles and services offered by approved providers.
      </p>

      {providers.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="text-lg text-slate-600">No providers available yet. Check back later!</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="overflow-hidden p-0">
              <div className="h-32 bg-gradient-to-br from-pink-200 via-violet-200 to-orange-200" />
              <div className="p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-slate-950">{provider.professionalName}</h3>
                  <p className="text-sm text-slate-500">
                    by {provider.user?.firstName} {provider.user?.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{provider.city}</p>
                </div>
                <div className="mt-4">
                  <Link to={`/providers/${provider.id}`} className="w-full">
                    <Button className="w-full">View Profile</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
