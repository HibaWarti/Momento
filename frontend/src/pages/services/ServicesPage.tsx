import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { ServiceCard } from '../../components/services/ServiceCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { getServices } from '../../api/providerApi'
import type { Service } from '../../types/provider'

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadServices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getServices()
      setServices(response.services)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"></div>
          <p className="mt-4 text-slate-600">Loading services...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error}</p>
          <Button className="mt-4" onClick={loadServices}>Try again</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="purple">Services</Badge>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Find service providers</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Browse services and contact providers directly to discuss availability, details,
            and final price.
          </p>
        </div>

        <Button variant="outline">
          <SlidersHorizontal className="mr-2 inline" size={16} />
          Filters
        </Button>
      </div>

      <Card className="mt-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder="Search photography, decoration, makeup..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>

          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none">
            <option>All cities</option>
            <option>Casablanca</option>
            <option>Rabat</option>
            <option>Marrakech</option>
          </select>

          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none">
            <option>All categories</option>
            <option>Photography</option>
            <option>Decoration</option>
            <option>Beauty</option>
          </select>
        </div>
      </Card>

      {services.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="text-lg text-slate-600">No services available yet. Check back later!</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </main>
  )
}
