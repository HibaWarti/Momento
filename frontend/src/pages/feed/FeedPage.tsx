import { Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { PostCard } from '../../components/posts/PostCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePosts } from '../../hooks/usePosts'

const suggestions = [
  'Wedding photography',
  'Birthday decoration',
  'Makeup artists',
  'Event planners',
]

export function FeedPage() {
  const { posts, isLoading, error, loadPosts, createNewPost } = usePosts()
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
    // TODO: Implement with addOrUpdateReaction
    await loadPosts()
  }

  const handleReport = (postId: string) => {
    const reason = prompt('Reason for reporting this post:')
    if (reason) {
      // TODO: Implement with reportPost
      alert('Post reported successfully!')
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
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
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr_280px] lg:px-8">
      <aside className="hidden lg:block">
        <Card className="sticky top-28">
          <h2 className="font-bold text-slate-950">Momento</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Share memories and discover services from your community.
          </p>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center gap-3 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
              <Sparkles size={18} />
              Feed
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Search size={18} />
              Explore
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Users size={18} />
              Providers
            </button>
          </div>
        </Card>
      </aside>

      <section>
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <Badge variant="orange">Social feed</Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">Latest memories</h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover posts about past events, celebrations, and service ideas.
            </p>
          </div>

          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            Create post
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6 p-5">
            <textarea
              className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="What's on your mind?"
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={isCreating || !newPostContent.trim()}>
                {isCreating ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </Card>
        )}

        {posts.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-lg text-slate-600">No posts yet. Be the first to share a memory!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReact={handleReact}
                onReport={handleReport}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="hidden lg:block">
        <Card className="sticky top-28">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-violet-600" size={20} />
            <h2 className="font-bold text-slate-950">Trending services</h2>
          </div>

          <div className="mt-5 space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </main>
  )
}
