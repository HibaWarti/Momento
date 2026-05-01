import { Camera, Edit3, MapPin, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
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
import type { Post } from '../../types/post'
import type { PublicUserProfile, UserSummary } from '../../types/user'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<UserSummary[]>([])
  const [following, setFollowing] = useState<UserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  if (!user) {
    return null
  }

  useEffect(() => {
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
  }, [user.id])

  const profilePictureUrl = getAssetUrl(profile?.profilePicturePath)
  const profileInitial = useMemo(
    () => (profile?.firstName?.[0] || user.firstName[0]).toUpperCase(),
    [profile?.firstName, user.firstName],
  )

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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-slate-600">Loading your profile...</p>
        </div>
      </main>
    )
  }

  const activeProfile = profile ?? user

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden p-0">
        <div className="h-44 bg-gradient-to-r from-orange-200 via-pink-200 to-violet-200" />

        <div className="px-6 pb-6">
          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="-mt-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={activeProfile.firstName}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-2xl font-bold text-white shadow-sm">
                  {profileInitial}
                </div>
              )}

              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-950">
                    {activeProfile.firstName} {activeProfile.lastName}
                  </h1>
                  <Badge variant="orange">{activeProfile.role}</Badge>
                </div>

                <p className="mt-1 text-slate-500">@{activeProfile.username}</p>

                {activeProfile.bio && (
                  <p className="mt-3 leading-7 text-slate-700">{activeProfile.bio}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handleProfilePictureChange(event)}
                  disabled={isUploadingPicture}
                />
                <Button variant="outline" type="button">
                  <Camera className="mr-2 inline" size={16} />
                  {isUploadingPicture ? 'Uploading...' : 'Update picture'}
                </Button>
              </label>

              <Button variant="outline" type="button" disabled>
                <Settings className="mr-2 inline" size={16} />
                Backend later
              </Button>

              <Button type="button" onClick={() => setIsEditing((current) => !current)}>
                <Edit3 className="mr-2 inline" size={16} />
                {isEditing ? 'Close editor' : 'Edit profile'}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-2xl bg-orange-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">
                {activeProfile._count?.posts ?? posts.length}
              </p>
              <p className="text-sm text-slate-500">Posts</p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">
                {activeProfile._count?.followers ?? followers.length}
              </p>
              <p className="text-sm text-slate-500">Followers</p>
            </div>

            <div className="rounded-2xl bg-pink-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-950">
                {activeProfile._count?.following ?? following.length}
              </p>
              <p className="text-sm text-slate-500">Following</p>
            </div>
          </div>

          {isEditing && (
            <Card className="mt-6 bg-slate-50">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">First name</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Last name</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Username</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Bio</span>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
            </Card>
          )}
        </div>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Posts</h2>
              <p className="text-sm text-slate-500">Memories shared by this user.</p>
            </div>

            <Button variant="outline" disabled>
              <Camera className="mr-2 inline" size={16} />
              Create from feed
            </Button>
          </div>

          {posts.length === 0 ? (
            <Card className="text-center">
              <p className="text-slate-600">No public posts found for this profile yet.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <h2 className="font-bold text-slate-950">Following</h2>
            <p className="mt-2 text-sm text-slate-500">
              Profiles you currently follow.
            </p>
          </Card>

          {(following.length > 0 ? following : followers).map((listUser) => (
            <UserCard key={listUser.id} user={listUser} />
          ))}

          {following.length === 0 && followers.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500">No followers or following users yet.</p>
            </Card>
          ) : null}
        </aside>
      </div>
    </main>
  )
}
