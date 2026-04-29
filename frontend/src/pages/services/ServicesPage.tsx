import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

const services = [
  {
    title: 'Event Photography',
    provider: 'Lina Studio',
    city: 'Casablanca',
    category: 'Photography',
    price: 'From 800 MAD',
  },
  {
    title: 'Birthday Decoration',
    provider: 'Bloom Events',
    city: 'Rabat',
    category: 'Decoration',
    price: 'Discuss price',
  },
  {
    title: 'Makeup Artist',
    provider: 'Nora Beauty',
    city: 'Marrakech',
    category: 'Beauty',
    price: 'From 500 MAD',
  },
]

export function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge variant="purple">Services</Badge>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Find service providers</h1>
          <p className="mt-2 text-slate-600">
            Contact providers directly to discuss details, availability, and final price.
          </p>
        </div>

        <Button variant="outline">Filter services</Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title} className="overflow-hidden p-0">
            <div className="h-44 bg-gradient-to-br from-orange-200 to-pink-200" />
            <div className="p-6">
              <Badge variant="orange">{service.category}</Badge>
              <h3 className="mt-4 text-lg font-bold text-slate-950">{service.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {service.provider} · {service.city}
              </p>
              <p className="mt-4 font-semibold text-slate-950">{service.price}</p>
              <Button className="mt-5 w-full">Contact Provider</Button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}