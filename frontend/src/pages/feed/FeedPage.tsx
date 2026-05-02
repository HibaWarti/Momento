import { Search, Sparkles, TrendingUp, Users, Plus } from 'lucide-react'
import { useState } from 'react'
import { PostCard } from '../../components/posts/PostCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  addOrUpdateReaction,
  addPostComment,
  deletePost,
  reportPost,
  updatePost,
} from '../../api/postApi'
import { usePosts } from '../../hooks/usePosts'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { paths } from '../../routes/paths'

const suggestions = [
  'Wedding photography',
  'Birthday decoration',
  'Makeup artists',
  'Event planners',
]

export function FeedPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { posts, isLoading, error, loadPosts, createNewPost, removePostFromList } = usePosts()
  const [newPostContent, setNewPostContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    try {
      setIsCreating(true)
      await createNewPost(newPostContent.trim())
      setNewPostContent('')
      setShowCreateForm(false)
    } catch {
    } finally {
      setIsCreating(false)
    }
  }

  const handleReact = async (postId: string) => {
    try {
      await addOrUpdateReaction(postId, 'LIKE')
      await loadPosts()
    } catch {
    }
  }

  const handleComment = async (postId: string) => {
    const content = prompt('Write your comment')
    if (!content?.trim()) {
      return
    }

    try {
      await addPostComment(postId, content.trim())
      await loadPosts()
    } catch {
    }
  }

  const handleEdit = async (postId: string) => {
    const post = posts.find((item) => item.id === postId)
    const content = prompt('Update your post', post?.content ?? '')
    if (!content?.trim()) {
      return
    }

    try {
      await updatePost(postId, content.trim())
      await loadPosts()
    } catch {
    }
  }

  const handleDelete = async (postId: string) => {
    const confirmed = window.confirm('Delete this post?')
    if (!confirmed) {
      return
    }

    try {
      await deletePost(postId)
      removePostFromList(postId)
    } catch {
    }
  }

  const handleReport = async (postId: string) => {
    const reason = prompt('Reason for reporting this post:')
    if (!reason?.trim()) {
      return
    }

    const description = prompt('Additional details (optional)') || undefined

    try {
      await reportPost(postId, reason.trim(), description)
      alert('Post reported successfully!')
    } catch {
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading posts...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <p className="text-lg text-red-600">{error}</p>
          <Button className="mt-4" onClick={loadPosts}>Try again</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr_300px] lg:px-8">
      <aside className="hidden lg:block">
        <Card className="sticky top-28 overflow-hidden border-slate-200">
          <div className="p-6">
            <h2 className="font-bold text-xl text-slate-900">Momento</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Share memories and discover services from your community.
            </p>
          </div>

          <div className="px-4 pb-6 space-y-1">
            <button className="flex w-full items-center gap-3 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900">
              <Sparkles size={18} />
              Feed
            </button>

            <button
              onClick={() => navigate(paths.explore)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Search size={18} />
              Explore
            </button>

            <button
              onClick={() => navigate(paths.providers)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Users size={18} />
              Providers
            </button>
          </div>
        </Card>
      </aside>

      <section className="max-w-2xl mx-auto w-full">
        <div className="mb-8 flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Sparkles size={22} />
            </div>
            <div>
              <Badge variant="orange">Social Feed</Badge>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Latest Memories</h1>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="mr-2" size={18} />
            Create Post
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-8 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <p className="font-semibold text-slate-900">Share a new memory</p>
            </div>
            <textarea
              className="mb-4 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="What's on your mind?"
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={isCreating || !newPostContent.trim()}
                className="bg-slate-900 text-white"
              >
                {isCreating ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </Card>
        )}

        {posts.length === 0 ? (
          <Card className="p-10 text-center border-slate-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Sparkles className="text-slate-600" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No memories yet</h3>
            <p className="mt-1 text-slate-600">Be the first to share a memory with the community!</p>
            <Button
              className="mt-5 bg-slate-900 text-white"
              onClick={() => setShowCreateForm(true)}
            >
              Create First Post
            </Button>
          </Card>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onReact={handleReact}
                onComment={handleComment}
                onReport={handleReport}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="hidden lg:block">
        <Card className="sticky top-28 overflow-hidden border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Trending Services</h2>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => navigate(paths.explore)}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      </aside>
    </main>
  )
}
