import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { createOrGetConversation } from '../../api/chatApi'
import { paths } from '../../routes/paths'
import { useAuthStore } from '../../store/authStore'
import type { Service } from '../../types/provider'

type ServiceCardProps = {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isStartingConversation, setIsStartingConversation] = useState(false)
  const reviewsCount = service._count?.reviews || 0

  const handleContact = async () => {
    const participantId = service.providerProfile?.user?.id

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
    } finally {
      setIsStartingConversation(false)
    }
  }

  return (
    <Card className="overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-md">
      <div className="h-44 bg-gradient-to-br from-orange-200 via-pink-200 to-violet-200" />

      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="purple">{service.category}</Badge>

          {reviewsCount > 0 && (
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-normal text-slate-400">({reviewsCount})</span>
            </div>
          )}
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-950">{service.title}</h3>

        <p className="mt-1 text-sm text-slate-500">
          by {service.providerProfile?.professionalName || 'Provider'}
        </p>

        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={16} />
          {service.city}
        </p>

        <p className="mt-4 font-semibold text-slate-950">
          {service.price ? `From ${service.price} MAD` : 'Discuss price'}
        </p>

        <div className="mt-5 flex gap-3">
          <Link to={`/services/${service.id}`} className="flex-1">
            <Button className="w-full">View details</Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => void handleContact()}
            disabled={isStartingConversation || !service.providerProfile?.user?.id}
          >
            {isStartingConversation ? 'Opening...' : 'Contact'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
