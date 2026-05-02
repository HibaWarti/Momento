import { Camera, Calendar, Edit3, Mail, MessageSquare, Settings, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { PostCard } from '../../components/posts/PostCard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { UserCard } from '../../components/users/UserCard'
import { getAssetUrl } from '../../api/client'
import { getPosts } from '../../api/postApi'
import {
  getFollowers,
  getFollowing,
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
} from '../../api/userApi'
import { useAuthStore } from '../../store/authStore'
import { paths } from '../../routes/paths'
import type { Post } from '../../types/post'
import type { PublicUserProfile, UserSummary } from '../../types/user'

type ProfileTab = 'posts' | 'followers' | 'following'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<UserSummary[]>([])
  const [following, setFollowing] = useState<UserSummary[]>([])
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const profileResponse = await getMyProfile()
        const currentProfile = profileResponse.user
        setProfile(currentProfile)
        setFirstName(currentProfile.firstName)
        setLastName(currentProfile.lastName)
        setUsername(currentProfile.username)
        setBio(currentProfile.bio ?? '')

        const [postsResponse, followersResponse, followingResponse] = await Promise.all([
          getPosts(),
          getFollowers(currentProfile.id),
          getFollowing(currentProfile.id),
        ])

        setPosts(postsResponse.posts.filter((post) => post.authorId === currentProfile.id))
        setFollowers(followersResponse.users)
        setFollowing(followingResponse.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfileData()
  }, [user])

  const activeProfile = profile ?? user
  const profilePictureUrl = getAssetUrl(activeProfile?.profilePicturePath)
  const profileInitial = useMemo(() => {
    if (!activeProfile) return 'M'
    return (activeProfile.firstName?.[0] || activeProfile.username?.[0] || 'M').toUpperCase()
  }, [activeProfile])

  const displayName = activeProfile
    ? `${activeProfile.firstName} ${activeProfile.lastName}`.trim()
    : 'Momento User'

  const joinedDate = activeProfile?.createdAt
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
        new Date(activeProfile.createdAt),
      )
    : 'Recently'

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      setError(null)
      const response = await updateMyProfile({
        firstName,
        lastName,
        username,
        bio: bio.trim() || null,
      })
      setProfile(response.user)
      setIsEditing(false)
      await loadCurrentUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfilePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setIsUploadingPicture(true)
      setError(null)
      const response = await uploadProfilePicture(file)
      setProfile(response.user)
      await loadCurrentUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile picture')
    } finally {
      setIsUploadingPicture(false)
      event.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--theme-border)] border-t-[var(--theme-primary)]"></div>
          <p className="mt-4 text-[var(--theme-muted)]">Loading your profile...</p>
        </div>
      </main>
    )
  }

  if (!activeProfile) {
    return null
  }

  const tabCounts = {
    posts: posts.length,
    followers: followers.length,
    following: following.length,
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden p-0">
        <div
          className="relative h-48 md:h-64"
          style={{
            background: `linear-gradient(120deg, var(--theme-primary), var(--theme-secondary), var(--theme-accent))`,
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <label className="absolute bottom-4 right-4 inline-flex">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleProfilePictureChange(event)}
              disabled={isUploadingPicture}
            />
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60">
              <Camera size={16} />
              {isUploadingPicture ? 'Uploading...' : 'Cover style'}
            </span>
          </label>
        </div>

        <div className="px-5 pb-6 sm:px-6">
          {error && (
            <div className="mt-5 rounded-lg border border-[var(--theme-error)]/30 bg-[var(--theme-error)]/10 p-4 text-sm text-[var(--theme-error)]">
              {error}
            </div>
          )}

          <div className="-mt-16 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={displayName}
                    className="h-32 w-32 rounded-full border-4 border-[var(--theme-card)] object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[var(--theme-card)] bg-[var(--theme-primary)] text-3xl font-bold text-white shadow-sm">
                    {profileInitial}
                  </div>
                )}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-[var(--theme-foreground)]">
                    {displayName}
                  </h1>
                  <Badge variant="purple">{activeProfile.role}</Badge>
                </div>

                <p className="mt-1 text-[var(--theme-muted)]">@{activeProfile.username}</p>

                {activeProfile.bio ? (
                  <p className="mt-3 max-w-2xl leading-7 text-[var(--theme-foreground)]">
                    {activeProfile.bio}
                  </p>
                ) : (
                  <p className="mt-3 max-w-2xl leading-7 text-[var(--theme-muted)]">
                    Add a short bio to tell people what kind of moments you love sharing.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--theme-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    Joined {joinedDate}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users size={16} />
                    Social profile
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" type="button" disabled>
                <MessageSquare className="mr-2 inline" size={16} />
                Message
              </Button>
              <Button variant="outline" type="button" disabled>
                <Mail className="mr-2 inline" size={16} />
                Email
              </Button>
              <Link to={paths.settings}>
                <Button variant="outline" type="button">
                  <Settings className="mr-2 inline" size={16} />
                  Settings
                </Button>
              </Link>
              <Button type="button" onClick={() => setIsEditing((current) => !current)}>
                <Edit3 className="mr-2 inline" size={16} />
                {isEditing ? 'Close editor' : 'Edit profile'}
              </Button>
            </div>
          </div>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
            {([
              ['Posts', posts.length, 'var(--theme-primary)'],
              ['Followers', followers.length, 'var(--theme-secondary)'],
              ['Following', following.length, 'var(--theme-accent)'],
            ] as const).map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--theme-border)] p-4 text-center"
                style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)` }}
              >
                <p className="text-2xl font-bold text-[var(--theme-foreground)]">{value}</p>
                <p className="text-sm text-[var(--theme-muted)]">{label}</p>
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="mt-6 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-background)] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--theme-foreground)]">
                    First name
                  </span>
                  <input
                    className="w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] px-4 py-3 text-sm text-[var(--theme-foreground)] outline-none focus:border-[var(--theme-primary)]"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--theme-foreground)]">
                    Last name
                  </span>
                  <input
                    className="w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] px-4 py-3 text-sm text-[var(--theme-foreground)] outline-none focus:border-[var(--theme-primary)]"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--theme-foreground)]">
                    Username
                  </span>
                  <input
                    className="w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] px-4 py-3 text-sm text-[var(--theme-foreground)] outline-none focus:border-[var(--theme-primary)]"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-[var(--theme-foreground)]">Bio</span>
                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] px-4 py-3 text-sm text-[var(--theme-foreground)] outline-none focus:border-[var(--theme-primary)]"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleSaveProfile()} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-6 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)]">
        <div className="grid grid-cols-3">
          {(['posts', 'followers', 'following'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-4 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]'
                  : 'border-transparent text-[var(--theme-muted)] hover:text-[var(--theme-foreground)]'
              }`}
            >
              {tab} <span className="font-normal">({tabCounts[tab]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'posts' && (
          <section>
            {posts.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-lg font-semibold text-[var(--theme-foreground)]">No posts yet</p>
                <p className="mt-2 text-[var(--theme-muted)]">
                  Shared memories from this profile will appear here.
                </p>
              </Card>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={user?.id} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'followers' && (
          <section className="grid gap-4 md:grid-cols-2">
            {followers.length === 0 ? (
              <Card className="md:col-span-2">
                <p className="text-center text-[var(--theme-muted)]">No followers yet.</p>
              </Card>
            ) : (
              followers.map((listUser) => <UserCard key={listUser.id} user={listUser} />)
            )}
          </section>
        )}

        {activeTab === 'following' && (
          <section className="grid gap-4 md:grid-cols-2">
            {following.length === 0 ? (
              <Card className="md:col-span-2">
                <p className="text-center text-[var(--theme-muted)]">Not following anyone yet.</p>
              </Card>
            ) : (
              following.map((listUser) => <UserCard key={listUser.id} user={listUser} />)
            )}
          </section>
        )}
      </div>
    </main>
  )
}
