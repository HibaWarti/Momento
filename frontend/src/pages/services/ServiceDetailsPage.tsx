import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, Star } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { mockServiceReviews, mockServices } from '../../data/mockServices'

const imageColors: Record<string, string> = {
  orange: 'from-orange-200 to-orange-400',
  pink: 'from-pink-200 to-pink-400',
  violet: 'from-violet-200 to-violet-400',
}

export function ServiceDetailsPage() {
  const { serviceId } = useParams()

  const service = mockServices.find((item) => item.id === serviceId) ?? mockServices[0]

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600"
      >
        <ArrowLeft size={16} />
        Back to services
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {service.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`h-64 rounded-3xl bg-gradient-to-br ${
                    imageColors[image] || imageColors.orange
                  }`}
                />
              ))}
            </div>
          </Card>

          <Card>
            <Badge variant="purple">{service.category}</Badge>

            <h1 className="mt-4 text-4xl font-bold text-slate-950">{service.title}</h1>

            <p className="mt-3 flex items-center gap-2 text-slate-500">
              <MapPin size={18} />
              {service.city}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Star size={18} className="fill-yellow-400 text-yellow-400" />
              {service.rating}
              <span className="font-normal text-slate-400">
                ({service.reviewsCount} reviews)
              </span>
            </div>

            <p className="mt-6 leading-8 text-slate-700">{service.description}</p>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">Reviews</h2>

            <div className="mt-5 space-y-5">
              {mockServiceReviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                      {review.avatar}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">{review.userName}</p>
                      <p className="text-sm text-slate-400">{review.date}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1 text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} size={16} className="fill-yellow-400" />
                    ))}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-28">
            <p className="text-sm text-slate-500">Price indication</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{service.price}</p>

            <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-800">
              Discuss details, availability, and final price directly with the provider.
              Online payment is not included in this first version.
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {service.providerAvatar}
              </div>

              <div>
                <p className="font-semibold text-slate-950">{service.providerName}</p>
                <p className="text-sm text-slate-500">@{service.providerUsername}</p>
              </div>
            </div>

            <Button className="mt-6 w-full">
              <MessageCircle className="mr-2 inline" size={16} />
              Contact Provider
            </Button>

            <Button variant="outline" className="mt-3 w-full">
              View Provider Profile
            </Button>
          </Card>
        </aside>
      </div>
    </main>
  )
}