import { UserPlus } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type UserCardProps = {
  user: {
    id: string
    name: string
    username: string
    avatar: string
    bio: string
  }
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
          {user.avatar}
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">{user.name}</h3>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">{user.bio}</p>
        </div>
      </div>

      <Button variant="outline" className="shrink-0">
        <UserPlus className="mr-2 inline" size={16} />
        Follow
      </Button>
    </Card>
  )
}