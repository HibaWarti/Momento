import { MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ServiceCard } from '../../components/services/ServiceCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { getProviderById } from '../../api/providerApi'
import { getAssetUrl } from '../../api/client'
import { paths } from '../../routes/paths'
import type { ProviderProfile } from '../../types/provider'

export function ProviderProfilePage() {
  const { providerId } = useParams()
  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const providerServices = useMemo(() => provider?.services ?? [], [provider])

  useEffect(() => {
    const loadProvider = async () => {
      if (!providerId) {
        setError('Provider not found')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await getProviderById(providerId)
        setProvider(response.provider)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider profile')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProvider()
  }, [providerId])

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
          <p className="mt-4 text-slate-600">Loading provider profile...</p>
        </div>
      </main>
    )
  }

  if (error || !provider) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error || 'Provider not found'}</p>
          <Link to={paths.providers}>
            <Button className="mt-4">Back to providers</Button>
          </Link>
        </Card>
      </main>
    )
  }

  const providerName =
    provider.user?.firstName && provider.user?.lastName
      ? `${provider.user.firstName} ${provider.user.lastName}`
      : provider.professionalName
  const providerInitials = provider.professionalName.slice(0, 2).toUpperCase()
  const profilePictureUrl = getAssetUrl(provider.user?.profilePicturePath)

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="overflow-hidden p-0">
        <div className="h-48 bg-gradient-to-r from-violet-200 via-pink-200 to-orange-200" />

        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={provider.professionalName}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-violet-600 text-2xl font-bold text-white shadow-sm">
                  {providerInitials}
                </div>
              )}

              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-950">{provider.professionalName}</h1>
                  <Badge variant="green">Verified Provider</Badge>
                </div>

                <p className="mt-1 text-slate-500">@{provider.user?.username}</p>

                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  {provider.city}
                </p>
              </div>
            </div>

            <Button disabled>
              <MessageCircle className="mr-2 inline" size={16} />
              Contact Provider
            </Button>
          </div>

          <p className="mt-6 max-w-3xl leading-7 text-slate-700">
            {provider.professionalDescription}
          </p>

          <div className="mt-6 grid max-w-2xl gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-violet-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{providerServices.length}</p>
              <p className="text-sm text-slate-500">Services</p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">{providerName}</p>
              <p className="text-sm text-slate-500">Provider</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 text-center">
              <p className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-950">
                <ShieldCheck size={24} />
                Active
              </p>
              <p className="text-sm text-slate-500">Status</p>
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Services</h2>
          <p className="mt-2 text-slate-500">Services published by this provider.</p>
        </div>

        {providerServices.length === 0 ? (
          <Card className="mt-6 text-center">
            <p className="text-slate-600">This provider has not published any services yet.</p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {providerServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
