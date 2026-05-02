import { UserPlus } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { UserSummary } from '../../types/user'

type UserCardProps = {
  user: UserSummary
}

export function UserCard({ user }: UserCardProps) {
  const displayName = `${user.firstName} ${user.lastName}`.trim()
  const avatar = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()

  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--theme-secondary)] text-sm font-bold text-white">
          {avatar || 'US'}
        </div>

        <div>
          <h3 className="font-semibold text-[var(--theme-foreground)]">{displayName}</h3>
          <p className="text-sm text-[var(--theme-muted)]">@{user.username}</p>
          <p className="mt-1 line-clamp-1 text-sm text-[var(--theme-muted)]">
            {user.bio || 'No bio yet.'}
          </p>
        </div>
      </div>

      <Button variant="outline" className="shrink-0" disabled>
        <UserPlus className="mr-2 inline" size={16} />
        Follow
      </Button>
    </Card>
  )
}
