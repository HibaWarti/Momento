import { Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

type PostCardProps = {
  post: {
    id: string
    authorName: string
    username: string
    avatar: string
    timeAgo: string
    location: string
    content: string
    images: string[]
    reactions: number
    comments: number
    category: string
  }
}

const imageColors: Record<string, string> = {
  orange: 'from-orange-200 to-orange-400',
  pink: 'from-pink-200 to-pink-400',
  violet: 'from-violet-200 to-violet-400',
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            {post.avatar}
          </div>

          <div>
            <p className="font-semibold text-slate-950">{post.authorName}</p>
            <p className="text-sm text-slate-500">
              @{post.username} · {post.location} · {post.timeAgo}
            </p>
          </div>
        </div>

        <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="p-5">
        <Badge variant="orange">{post.category}</Badge>

        <p className="mt-4 leading-7 text-slate-700">{post.content}</p>

        <div
          className={`mt-5 grid gap-3 ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.images.map((image, index) => (
            <div
              key={`${post.id}-${image}-${index}`}
              className={`h-56 rounded-3xl bg-gradient-to-br ${
                imageColors[image] || imageColors.orange
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-pink-600">
            <Heart size={20} />
            {post.reactions}
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600">
            <MessageCircle size={20} />
            {post.comments}
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-600">
            <Send size={20} />
            Share
          </button>
        </div>

        <p className="hidden text-sm text-slate-400 sm:block">View discussion</p>
      </div>
    </Card>
  )
}