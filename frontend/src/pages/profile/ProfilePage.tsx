import { Camera, Edit3, MapPin, Settings } from 'lucide-react'
import { PostCard } from '../../components/posts/PostCard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { UserCard } from '../../components/users/UserCard'
import { mockPosts } from '../../data/mockPosts'
import { mockSuggestedUsers } from '../../data/mockUsers'
import { useAuthStore } from '../../store/authStore'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden p-0">
        <div className="h-44 bg-gradient-to-r from-orange-200 via-pink-200 to-violet-200" />

        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-2xl font-bold text-white shadow-sm">
                {user.firstName[0]}
              </div>

              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-950">{user.firstName} {user.lastName}</h1>
                  <Badge variant="orange">{user.role}</Badge>
                </div>

                <p className="mt-1 text-slate-500">@{user.username}</p>

                {user.bio && (
                  <p className="mt-3 leading-7 text-slate-700">{user.bio}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Settings className="mr-2 inline" size={16} />
                Settings
              </Button>

              <Button>
                <Edit3 className="mr-2 inline" size={16} />
                Edit profile
              </Button>
            </div>
          </div>

          <div className="mt-6 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-2xl bg-orange-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">0</p>
              <p className="text-sm text-slate-500">Posts</p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">0</p>
              <p className="text-sm text-slate-500">Followers</p>
            </div>

            <div className="rounded-2xl bg-pink-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">0</p>
              <p className="text-sm text-slate-500">Following</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Posts</h2>
              <p className="text-sm text-slate-500">Memories shared by this user.</p>
            </div>

            <Button variant="outline">
              <Camera className="mr-2 inline" size={16} />
              New post
            </Button>
          </div>

          <div className="space-y-6">
            {mockPosts.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <h2 className="font-bold text-slate-950">Suggested profiles</h2>
            <p className="mt-2 text-sm text-slate-500">
              Discover people and providers from the community.
            </p>
          </Card>

          {mockSuggestedUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </aside>
      </div>
    </main>
  )
}