import { useState, useEffect } from 'react'
import { Search, Hash, TrendingUp, Filter } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PostCard } from '../../components/posts/PostCard'
import { ServiceCard } from '../../components/services/ServiceCard'
import { getPosts } from '../../api/postApi'
import { getServices } from '../../api/providerApi'
import type { Post } from '../../types/post'
import type { Service } from '../../types/provider'

const trendingHashtags = [
  { name: 'Wedding', posts: 1234 },
  { name: 'Birthday', posts: 987 },
  { name: 'Graduation', posts: 654 },
  { name: 'NewYear', posts: 876 },
  { name: 'BabyShower', posts: 432 },
  { name: 'Anniversary', posts: 543 },
]

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'services'>('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [postsRes, servicesRes] = await Promise.all([
          getPosts(),
          getServices(),
        ])
        setPosts(postsRes.posts)
        setServices(servicesRes.services)
      } catch (err) {
        console.error('Failed to load explore data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explore</h1>
        <p className="mt-2 text-slate-600">
          Discover trending memories and services.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search memories, services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <div className="flex gap-2">
              {(['all', 'posts', 'services'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 space-y-5">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-slate-100 rounded-xl"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {(activeTab === 'all' || activeTab === 'posts') &&
                filteredPosts.slice(0, activeTab === 'all' ? 3 : filteredPosts.length).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}

              {(activeTab === 'all' || activeTab === 'services') && (
                <div className={activeTab === 'all' ? 'mt-8' : ''}>
                  <div className="grid gap-5 md:grid-cols-2">
                    {filteredServices
                      .slice(0, activeTab === 'all' ? 4 : filteredServices.length)
                      .map((service) => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                  </div>
                </div>
              )}

              {filteredPosts.length === 0 && filteredServices.length === 0 && (
                <Card className="mt-8 text-center py-12">
                  <p className="text-slate-600">No results found for "{searchQuery}"</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                </Card>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <Card className="overflow-hidden border-slate-200">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Trending hashtags</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {trendingHashtags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => setSearchQuery(tag.name)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">#{tag.name}</span>
                  <span className="text-xs text-slate-500">{tag.posts.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-slate-200">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Popular categories</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {['Wedding photography', 'Event planning', 'Birthday decor', 'Makeup artists'].map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setSearchQuery(cat)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                    {i + 1}
                  </span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  )
}
