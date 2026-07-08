import { createClient } from '@/lib/supabase/server'

export interface PostWithDetails {
  id: string
  user_id: string
  content: string | null
  visibility: 'public' | 'private'
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  post_images: { id: string; image_url: string }[]
  post_videos: { id: string; video_url: string; view_count: number }[]
  post_music: { id: string; title: string; artist: string | null; file_url: string; cover_url: string | null }[]
  post_likes: { id: string; user_id: string }[]
  comments: { id: string }[]
  _count: {
    post_likes: number
    comments: number
  }
}

export async function getFeed(cursor?: string, limit = 10) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!inner(id, username, full_name, avatar_url),
      post_images(id, image_url),
      post_videos(id, video_url, view_count),
      post_music(id, title, artist, file_url, cover_url),
      post_likes(id, user_id),
      comments(id),
      _count
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: posts, error } = await query

  if (error) throw new Error(error.message)

  let nextCursor: string | undefined
  if (posts && posts.length > limit) {
    const nextItem = posts.pop()
    nextCursor = nextItem?.created_at
  }

  const postsWithUserLikeStatus = posts?.map((post) => ({
    ...post,
    isLiked: post.post_likes.some((like) => like.user_id === user.id),
    isSaved: false,
  }))

  return {
    data: postsWithUserLikeStatus as PostWithDetails[],
    nextCursor,
  }
}
