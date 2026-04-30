import { Heart, MessageCircle, MoreHorizontal, Send, Flag } from 'lucide-react'
import { Card } from '../ui/Card'
import type { Post } from '../../types/post'

type PostCardProps = {
  post: Post
  onReact?: (postId: string) => void
  onReport?: (postId: string) => void
}

export function PostCard({ post, onReact, onReport }: PostCardProps) {
  const authorInitials = `${post.author.firstName[0]}${post.author.lastName[0]}`
  const reactionCount = post._count?.reactions || 0
  const commentCount = post._count?.comments || 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            {authorInitials}
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              {post.author.firstName} {post.author.lastName}
            </p>
            <p className="text-sm text-slate-500">
              @{post.author.username} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <button
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => onReport?.(post.id)}
        >
          <Flag size={20} />
        </button>
      </div>

      <div className="p-5">
        <p className="leading-7 text-slate-700">{post.content}</p>

        {post.images.length > 0 && (
          <div
            className={`mt-5 grid gap-3 ${
              post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {post.images.map((image, index) => (
              <div
                key={`${post.id}-${image.id}-${index}`}
                className="h-56 rounded-3xl bg-gradient-to-br from-orange-200 to-orange-400"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-pink-600"
            onClick={() => onReact?.(post.id)}
          >
            <Heart size={20} />
            {reactionCount}
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600">
            <MessageCircle size={20} />
            {commentCount}
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