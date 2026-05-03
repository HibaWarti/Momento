import { Flag, Heart, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { getAssetUrl } from '../../api/client'
import { ProviderBadge } from '../users/ProviderBadge'
import type { Post, ReactionType } from '../../types/post'

type PostCardProps = {
  post: Post
  currentUserId?: string
  onReact?: (postId: string, type: ReactionType) => void
  onComment?: (postId: string) => void
  onReport?: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
}

const reactionOptions: Array<{ type: ReactionType; label: string }> = [
  { type: 'LIKE', label: 'Like' },
  { type: 'LOVE', label: 'Love' },
  { type: 'WOW', label: 'Wow' },
  { type: 'HAHA', label: 'Haha' },
  { type: 'SAD', label: 'Sad' },
  { type: 'ANGRY', label: 'Angry' },
]

export function PostCard({
  post,
  currentUserId,
  onReact,
  onComment,
  onReport,
  onEdit,
  onDelete,
}: PostCardProps) {
  const authorInitials = `${post.author.firstName[0]}${post.author.lastName[0]}`
  const reactionCount = post._count?.reactions || 0
  const commentCount = post._count?.comments || 0
  const isOwnPost = post.authorId === currentUserId
  const currentUserReaction = post.reactions?.find((reaction) => reaction.userId === currentUserId)
  const isProvider = post.author.role === 'PROVIDER'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-[var(--theme-border)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-bold text-white">
            {authorInitials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-[var(--theme-foreground)]">
                {post.author.firstName} {post.author.lastName}
              </p>
              {isProvider ? <ProviderBadge compact /> : null}
            </div>
            <p className="text-sm text-[var(--theme-muted)]">
              @{post.author.username} - {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <button
          className="rounded-lg p-2 text-[var(--theme-muted)] hover:bg-[var(--theme-background)] hover:text-[var(--theme-foreground)]"
          onClick={() => onReport?.(post.id)}
          disabled={isOwnPost}
          aria-label="Report post"
          title="Report post"
        >
          <Flag size={20} />
        </button>
      </div>

      <div className="p-5">
        <p className="leading-7 text-[var(--theme-foreground)]">{post.content}</p>

        {post.images.length > 0 && (
          <div
            className={`mt-5 grid gap-3 ${
              post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {post.images.map((image, index) => {
              const imageUrl = getAssetUrl(image.imagePath || image.path)
              return imageUrl ? (
                <img
                  key={`${post.id}-${image.id}-${index}`}
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  className="h-56 w-full rounded-lg object-cover"
                />
              ) : (
                <div
                  key={`${post.id}-${image.id}-${index}`}
                  className="h-56 rounded-lg bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)]"
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--theme-border)] px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="group relative">
            <button
              className={`flex items-center gap-2 text-sm font-medium ${
                currentUserReaction
                  ? 'text-[var(--theme-error)]'
                  : 'text-[var(--theme-muted)] hover:text-[var(--theme-accent)]'
              }`}
              onClick={() => onReact?.(post.id, currentUserReaction?.type ?? 'LIKE')}
            >
              <Heart size={20} className={currentUserReaction ? 'fill-current' : ''} />
              {reactionCount}
            </button>
            <div className="invisible absolute bottom-8 left-0 z-10 flex min-w-max gap-1 rounded-full border border-[var(--theme-border)] bg-[var(--theme-card)] p-1.5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {reactionOptions.map((reaction) => (
                <button
                  key={reaction.type}
                  type="button"
                  className={`rounded-full px-2 py-1 text-xs font-semibold transition ${
                    currentUserReaction?.type === reaction.type
                      ? 'bg-[var(--theme-primary)] text-white'
                      : 'text-[var(--theme-muted)] hover:bg-[var(--theme-background)] hover:text-[var(--theme-foreground)]'
                  }`}
                  onClick={() => onReact?.(post.id, reaction.type)}
                >
                  {reaction.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="flex items-center gap-2 text-sm font-medium text-[var(--theme-muted)] hover:text-[var(--theme-primary)]"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle size={20} />
            {commentCount}
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-[var(--theme-muted)] hover:text-[var(--theme-secondary)]">
            <Send size={20} />
            Share
          </button>

          {isOwnPost ? (
            <>
              <button
                className="flex items-center gap-2 text-sm font-medium text-[var(--theme-muted)] hover:text-[var(--theme-secondary)]"
                onClick={() => onEdit?.(post.id)}
              >
                <Pencil size={18} />
                Edit
              </button>

              <button
                className="flex items-center gap-2 text-sm font-medium text-[var(--theme-muted)] hover:text-[var(--theme-error)]"
                onClick={() => onDelete?.(post.id)}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="hidden text-sm font-medium text-[var(--theme-muted)] hover:text-[var(--theme-primary)] sm:block"
          onClick={() => onComment?.(post.id)}
        >
          View discussion
        </button>
      </div>
    </Card>
  )
}
