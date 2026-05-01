import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  addServiceReview,
  deleteServiceReview,
  getServiceById,
  reportService,
  updateServiceReview,
} from '../../api/providerApi'
import { createOrGetConversation } from '../../api/chatApi'
import { getAssetUrl } from '../../api/client'
import { paths } from '../../routes/paths'
import { useAuthStore } from '../../store/authStore'
import type { Service, ServiceReview } from '../../types/provider'

export function ServiceDetailsPage() {
  const navigate = useNavigate()
  const { serviceId } = useParams()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [service, setService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [isStartingConversation, setIsStartingConversation] = useState(false)

  const currentUserReview = useMemo(
    () => service?.reviews?.find((review) => review.userId === user?.id) ?? null,
    [service?.reviews, user?.id],
  )

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        setError('Service not found')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await getServiceById(serviceId)
        setService(response.service)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service details')
      } finally {
        setIsLoading(false)
      }
    }

    void loadService()
  }, [serviceId])

  const handleReviewSubmit = async () => {
    if (!service) {
      return
    }

    const ratingInput = prompt(
      currentUserReview ? 'Update your rating (1-5)' : 'Add your rating (1-5)',
      currentUserReview ? String(currentUserReview.rating) : '5',
    )

    if (!ratingInput) {
      return
    }

    const commentInput = prompt(
      'Add an optional comment',
      currentUserReview?.comment ?? '',
    )

    try {
      setIsSavingReview(true)

      let review: ServiceReview
      if (currentUserReview) {
        const response = await updateServiceReview(currentUserReview.id, {
          rating: Number(ratingInput),
          comment: commentInput || undefined,
        })
        review = response.review
      } else {
        const response = await addServiceReview(service.id, {
          rating: Number(ratingInput),
          comment: commentInput || undefined,
        })
        review = response.review
      }

      setService((current) => {
        if (!current) {
          return current
        }

        const reviews = current.reviews ?? []
        const updatedReviews = currentUserReview
          ? reviews.map((item) => (item.id === review.id ? review : item))
          : [review, ...reviews]

        return {
          ...current,
          reviews: updatedReviews,
          _count: {
            ...current._count,
            reviews: currentUserReview
              ? current._count?.reviews ?? updatedReviews.length
              : (current._count?.reviews ?? 0) + 1,
          },
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review')
    } finally {
      setIsSavingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!currentUserReview || !service) {
      return
    }

    try {
      await deleteServiceReview(currentUserReview.id)
      setService((current) => {
        if (!current) {
          return current
        }

        const updatedReviews = (current.reviews ?? []).filter(
          (review) => review.id !== currentUserReview.id,
        )

        return {
          ...current,
          reviews: updatedReviews,
          _count: {
            ...current._count,
            reviews: Math.max(0, (current._count?.reviews ?? 1) - 1),
          },
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review')
    }
  }

  const handleReportService = async () => {
    if (!service) {
      return
    }

    const reason = prompt('Reason for reporting this service')
    if (!reason) {
      return
    }

    const description = prompt('Additional details (optional)') || undefined

    try {
      await reportService(service.id, reason, description)
      alert('Service reported successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report service')
    }
  }

  const handleContactProvider = async () => {
    const participantId = service?.providerProfile?.user?.id

    if (!isAuthenticated) {
      navigate(paths.login)
      return
    }

    if (!participantId) {
      return
    }

    try {
      setIsStartingConversation(true)
      const response = await createOrGetConversation(participantId)
      navigate(`/chats/${response.conversation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open conversation')
    } finally {
      setIsStartingConversation(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"></div>
          <p className="mt-4 text-slate-600">Loading service details...</p>
        </div>
      </main>
    )
  }

  if (error || !service) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error || 'Service not found'}</p>
          <Link to={paths.services}>
            <Button className="mt-4">Back to services</Button>
          </Link>
        </Card>
      </main>
    )
  }

  const reviews = service.reviews ?? []
  const reviewsCount = service._count?.reviews ?? reviews.length
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null
  const profilePictureUrl = getAssetUrl(service.providerProfile?.user?.profilePicturePath)
  const providerProfilePath = service.providerProfile
    ? `/providers/${service.providerProfile.id}`
    : paths.providers

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
          {error && (
            <Card className="border border-red-100 bg-red-50 text-red-700">
              {error}
            </Card>
          )}

          <Card className="overflow-hidden p-0">
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {service.images && service.images.length > 0 ? (
                service.images.map((image) => (
                  <img
                    key={image.id}
                    src={getAssetUrl(image.imagePath) || undefined}
                    alt={service.title}
                    className="h-64 w-full rounded-3xl object-cover"
                  />
                ))
              ) : (
                <div className="col-span-full h-64 rounded-3xl bg-gradient-to-br from-orange-200 via-pink-200 to-violet-200" />
              )}
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
              {averageRating ?? 'No rating yet'}
              <span className="font-normal text-slate-400">({reviewsCount} reviews)</span>
            </div>

            <p className="mt-6 leading-8 text-slate-700">{service.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Button onClick={() => void handleReviewSubmit()} disabled={isSavingReview}>
                    {currentUserReview ? 'Update your review' : 'Add review'}
                  </Button>
                  {currentUserReview ? (
                    <Button variant="outline" onClick={() => void handleDeleteReview()}>
                      Delete review
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={() => void handleReportService()}>
                    Report service
                  </Button>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Log in to review or report this service.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">Reviews</h2>

            <div className="mt-5 space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                      {review.user?.firstName?.[0] ?? 'U'}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1 text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} size={16} className="fill-yellow-400" />
                    ))}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {review.comment || 'No comment provided.'}
                  </p>
                </div>
              ))}

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              ) : null}
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
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={service.providerProfile?.professionalName || 'Provider'}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  {service.providerProfile?.professionalName?.slice(0, 2).toUpperCase() || 'PR'}
                </div>
              )}

              <div>
                <p className="font-semibold text-slate-950">
                  {service.providerProfile?.professionalName || 'Provider'}
                </p>
                <p className="text-sm text-slate-500">
                  @{service.providerProfile?.user?.username}
                </p>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={() => void handleContactProvider()}
              disabled={isStartingConversation || !service.providerProfile?.user?.id}
            >
              <MessageCircle className="mr-2 inline" size={16} />
              {isStartingConversation ? 'Opening...' : 'Contact Provider'}
            </Button>

            <Link to={providerProfilePath}>
              <Button variant="outline" className="mt-3 w-full">
              View Provider Profile
              </Button>
            </Link>
          </Card>
        </aside>
      </div>
    </main>
  )
}
