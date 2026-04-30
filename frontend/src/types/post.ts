export type ReactionType = 'LIKE' | 'LOVE' | 'WOW' | 'HAHA' | 'SAD' | 'ANGRY'

export type PostStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED'

export type PostAuthor = {
  id: string
  firstName: string
  lastName: string
  username: string
  profilePicturePath?: string | null
}

export type PostImage = {
  id: string
  imagePath?: string
  path?: string
  postId?: string
  createdAt?: string
}

export type PostComment = {
  id: string
  content: string
  userId: string
  postId: string
  createdAt: string
  updatedAt?: string
  user: PostAuthor
}

export type PostReaction = {
  id: string
  type: ReactionType
  userId: string
  postId?: string
  createdAt?: string
}

export type Post = {
  id: string
  content: string
  status: PostStatus
  authorId: string
  createdAt: string
  updatedAt?: string
  author: PostAuthor
  images: PostImage[]
  comments?: PostComment[]
  reactions?: PostReaction[]
  _count?: {
    comments: number
    reactions: number
    reports?: number
  }
}

export type PostsResponse = {
  success: boolean
  message: string
  posts: Post[]
}

export type PostResponse = {
  success: boolean
  message: string
  post: Post
}

export type CommentsResponse = {
  success: boolean
  message: string
  comments: PostComment[]
}
