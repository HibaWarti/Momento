import { MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { ServiceCard } from '../../components/services/ServiceCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { mockServices } from '../../data/mockServices'

export function ProviderProfilePage() {
  const providerServices = mockServices.filter(
    (service) => service.providerUsername === 'yassine.photo',
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="overflow-hidden p-0">
        <div className="h-48 bg-gradient-to-r from-violet-200 via-pink-200 to-orange-200" />

        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-violet-600 text-2xl font-bold text-white shadow-sm">
                YS
              </div>

              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-950">Yassine Studio</h1>
                  <Badge variant="green">Verified Provider</Badge>
                </div>

                <p className="mt-1 text-slate-500">@yassine.photo</p>

                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  Rabat
                </p>
              </div>
            </div>

            <Button>
              <MessageCircle className="mr-2 inline" size={16} />
              Contact Provider
            </Button>
          </div>

          <p className="mt-6 max-w-3xl leading-7 text-slate-700">
            Professional photography studio specialized in event photography, engagement
            sessions, birthdays, and family celebrations.
          </p>

          <div className="mt-6 grid max-w-2xl gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-violet-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">4.8</p>
              <p className="text-sm text-slate-500">Rating</p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">34</p>
              <p className="text-sm text-slate-500">Reviews</p>
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

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {providerServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </main>
  )
}