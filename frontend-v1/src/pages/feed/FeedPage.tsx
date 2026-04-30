import { Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { PostCard } from '../../components/posts/PostCard'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockPosts } from '../../data/mockPosts'

const suggestions = [
  'Wedding photography',
  'Birthday decoration',
  'Makeup artists',
  'Event planners',
]

export function FeedPage() {
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

          <button className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
            Create post
          </button>
        </div>

        <div className="space-y-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
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