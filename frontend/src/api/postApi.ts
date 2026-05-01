import { apiRequest } from './client'
import type {
  CommentsResponse,
  Post,
  PostResponse,
  PostsResponse,
  ReactionType,
} from '../types/post'

export function getPosts() {
  return apiRequest<PostsResponse>('/posts', { auth: false })
}

export function createPost(content: string) {
  return apiRequest<PostResponse>('/posts', {
    method: 'POST',
    body: { content },
  })
}

export function getPostById(id: string) {
  return apiRequest<PostResponse>(`/posts/${id}`, { auth: false })
}

export function updatePost(id: string, content: string) {
  return apiRequest<PostResponse>(`/posts/${id}`, {
    method: 'PATCH',
    body: { content },
  })
}

export function deletePost(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${id}`, {
    method: 'DELETE',
  })
}

export function getPostComments(postId: string) {
  return apiRequest<CommentsResponse>(`/posts/${postId}/comments`, { auth: false })
}

export function addPostComment(postId: string, content: string) {
  return apiRequest<CommentsResponse>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { content },
  })
}

export function deletePostComment(commentId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export function addOrUpdateReaction(postId: string, type: ReactionType) {
  return apiRequest<PostResponse>(`/posts/${postId}/reactions`, {
    method: 'POST',
    body: { type },
  })
}

export function removeReaction(postId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/reactions`, {
    method: 'DELETE',
  })
}

export function reportPost(postId: string, reason: string, description?: string) {
  return apiRequest<{ success: boolean; message: string }>(`/posts/${postId}/reports`, {
    method: 'POST',
    body: { reason, description },
  })
}

export function uploadPostImages(postId: string, files: File[]) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('images', file)
  })

  return apiRequest<{
    success: boolean
    message: string
    images: Array<{
      id: string
      imagePath: string
      postId: string
      createdAt: string
    }>
  }>(`/posts/${postId}/images`, {
    method: 'POST',
    body: formData,
  })
}

export function deletePostImage(postId: string, imageId: string) {
  return apiRequest<{ success: boolean; message: string }>(
    `/posts/${postId}/images/${imageId}`,
    {
      method: 'DELETE',
    },
  )
}
