import { useState, useEffect } from 'react'
import { getPosts, createPost } from '../api/postApi'
import type { Post } from '../types/post'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getPosts()
      setPosts(response.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewPost = async (content: string) => {
    try {
      const response = await createPost(content)
      setPosts((prev) => [response.post, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      throw err
    }
  }

  const removePostFromList = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id))
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return {
    posts,
    isLoading,
    error,
    loadPosts,
    createNewPost,
    removePostFromList,
  }
}
