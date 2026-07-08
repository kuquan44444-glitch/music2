'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserPosts(userId: string, visibility?: 'public' | 'private', cursor?: string, limit = 10) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (visibility) {
    query = query.eq('visibility', visibility)
  }

  if (!user || user.id !== userId) {
    query = query.eq('visibility', 'public')
  }

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
    isLiked: user ? post.post_likes.some((like) => like.user_id === user.id) : false,
    isSaved: false,
  }))

  return {
    data: postsWithUserLikeStatus,
    nextCursor,
  }
}

export async function getUserPhotos(userId: string, cursor?: string, limit = 20) {
  const supabase = await createClient()
  
  let query = supabase
    .from('post_images')
    .select(`
      id,
      image_url,
      created_at,
      posts!inner(user_id, visibility)
    `)
    .eq('posts.user_id', userId)
    .eq('posts.visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: images, error } = await query

  if (error) throw new Error(error.message)

  let nextCursor: string | undefined
  if (images && images.length > limit) {
    const nextItem = images.pop()
    nextCursor = nextItem?.created_at
  }

  return {
    data: images,
    nextCursor,
  }
}

export async function getUserVideos(userId: string, cursor?: string, limit = 10) {
  const supabase = await createClient()
  
  let query = supabase
    .from('post_videos')
    .select(`
      id,
      video_url,
      view_count,
      created_at,
      posts!inner(user_id, visibility)
    `)
    .eq('posts.user_id', userId)
    .eq('posts.visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: videos, error } = await query

  if (error) throw new Error(error.message)

  let nextCursor: string | undefined
  if (videos && videos.length > limit) {
    const nextItem = videos.pop()
    nextCursor = nextItem?.created_at
  }

  return {
    data: videos,
    nextCursor,
  }
}

export async function getUserMusic(userId: string, cursor?: string, limit = 10) {
  const supabase = await createClient()
  
  let query = supabase
    .from('post_music')
    .select(`
      id,
      title,
      artist,
      file_url,
      cover_url,
      created_at,
      posts!inner(user_id, visibility)
    `)
    .eq('posts.user_id', userId)
    .eq('posts.visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: music, error } = await query

  if (error) throw new Error(error.message)

  let nextCursor: string | undefined
  if (music && music.length > limit) {
    const nextItem = music.pop()
    nextCursor = nextItem?.created_at
  }

  return {
    data: music,
    nextCursor,
  }
}

export async function getSavedPosts(userId: string, cursor?: string, limit = 10) {
  const supabase = await createClient()
  
  let query = supabase
    .from('saved_posts')
    .select(`
      id,
      created_at,
      posts!inner(
        id,
        user_id,
        content,
        visibility,
        created_at,
        profiles!inner(id, username, full_name, avatar_url),
        post_images(id, image_url),
        post_videos(id, video_url, view_count),
        post_music(id, title, artist, file_url, cover_url),
        post_likes(id, user_id),
        comments(id),
        _count
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: saved, error } = await query

  if (error) throw new Error(error.message)

  let nextCursor: string | undefined
  const posts = saved?.map((s) => s.posts).filter(Boolean) || []
  
  if (posts.length > limit) {
    posts.pop()
    nextCursor = saved?.[saved.length - 1]?.created_at
  }

  const { data: { user } } = await supabase.auth.getUser()

  const postsWithUserLikeStatus = posts.map((post: any) => ({
    ...post,
    isLiked: user ? post.post_likes.some((like: any) => like.user_id === user.id) : false,
    isSaved: true,
  }))

  return {
    data: postsWithUserLikeStatus,
    nextCursor,
  }
}
