import { Search, Sparkles, TrendingUp, Users, Plus, X, Trash2, Send } from 'lucide-react'
import { useState } from 'react'
import { PostCard } from '../../components/posts/PostCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  addOrUpdateReaction,
  addPostComment,
  deletePostComment,
  deletePost,
  getPostComments,
  removeReaction,
  reportPost,
  updatePost,
} from '../../api/postApi'
import { usePosts } from '../../hooks/usePosts'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { getAssetUrl } from '../../api/client'
import type { Post, PostComment, ReactionType } from '../../types/post'

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
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [comments, setComments] = useState<PostComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isPostingComment, setIsPostingComment] = useState(false)

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

  const handleReact = async (postId: string, type: ReactionType) => {
    try {
      const post = posts.find((item) => item.id === postId)
      const currentUserReaction = post?.reactions?.find((reaction) => reaction.userId === user?.id)

      if (currentUserReaction?.type === type) {
        await removeReaction(postId)
      } else {
        await addOrUpdateReaction(postId, type)
      }

      await loadPosts()
    } catch {
    }
  }

  const openComments = async (postId: string) => {
    const post = posts.find((item) => item.id === postId)
    if (!post) return

    try {
      setActivePost(post)
      setIsLoadingComments(true)
      const response = await getPostComments(postId)
      setComments(response.comments)
    } catch {
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const closeComments = () => {
    setActivePost(null)
    setComments([])
    setCommentDraft('')
  }

  const handleSubmitComment = async () => {
    if (!activePost || !commentDraft.trim()) {
      return
    }

    try {
      setIsPostingComment(true)
      const response = await addPostComment(activePost.id, commentDraft.trim())
      setComments((current) => [response.comment, ...current])
      setCommentDraft('')
      await loadPosts()
      setActivePost((current) =>
        current
          ? {
              ...current,
              _count: {
                ...current._count,
                comments: (current._count?.comments ?? 0) + 1,
                reactions: current._count?.reactions ?? 0,
              },
            }
          : current,
      )
    } catch {
    } finally {
      setIsPostingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deletePostComment(commentId)
      setComments((current) => current.filter((comment) => comment.id !== commentId))
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
                onComment={openComments}
                onReport={handleReport}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {activePost ? (
        <div className="fixed inset-0 z-[70] bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl lg:grid lg:grid-cols-[1fr_380px]">
            <section className="hidden min-h-0 bg-slate-950 lg:block">
              {activePost.images.length > 0 ? (
                <div className="flex h-full items-center justify-center p-4">
                  <img
                    src={getAssetUrl(activePost.images[0].imagePath || activePost.images[0].path) || ''}
                    alt="Post"
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-10 text-center text-white">
                  <p className="max-w-md text-xl leading-8">{activePost.content}</p>
                </div>
              )}
            </section>

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    {activePost.author.firstName} {activePost.author.lastName}
                  </p>
                  <p className="text-xs text-slate-500">@{activePost.author.username}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                  onClick={closeComments}
                  aria-label="Close comments"
                  title="Close comments"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="border-b border-slate-100 px-4 py-4">
                <p className="text-sm leading-6 text-slate-700">{activePost.content}</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {isLoadingComments ? (
                  <p className="text-sm text-slate-500">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <p className="font-semibold text-slate-950">No comments yet</p>
                      <p className="mt-1 text-sm text-slate-500">Start the conversation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {comments.map((comment) => {
                      const canDelete =
                        comment.userId === user?.id || activePost.authorId === user?.id
                      return (
                        <article key={comment.id} className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {comment.user.firstName[0]}
                            {comment.user.lastName[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-6 text-slate-700">
                              <span className="mr-2 font-semibold text-slate-950">
                                {comment.user.username}
                              </span>
                              {comment.content}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {canDelete ? (
                            <button
                              type="button"
                              className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              onClick={() => void handleDeleteComment(comment.id)}
                              aria-label="Delete comment"
                              title="Delete comment"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    rows={2}
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Add a comment..."
                    className="max-h-28 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                  <Button
                    type="button"
                    onClick={() => void handleSubmitComment()}
                    disabled={isPostingComment || !commentDraft.trim()}
                    className="px-3"
                    title="Post comment"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}

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
