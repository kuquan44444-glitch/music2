import { createClient } from '@/lib/supabase/server'

export interface SearchUser {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export interface SearchPost {
  id: string
  content: string | null
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  post_images: { id: string; image_url: string }[]
  _count: {
    post_likes: number
    comments: number
  }
}

export interface SearchHashtag {
  id: string
  name: string
  post_count?: number
}

export async function searchUsers(query: string, limit = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(limit)

  if (error) throw new Error(error.message)

  return data as SearchUser[]
}

export async function searchPosts(query: string, limit = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      profiles!inner(id, username, full_name, avatar_url),
      post_images(id, image_url),
      _count
    `)
    .eq('visibility', 'public')
    .textSearch('content', query)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return data as SearchPost[]
}

export async function searchHashtags(query: string, limit = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('hashtags')
    .select(`
      id,
      name,
      post_hashtags(count)
    `)
    .ilike('name', `%${query}%`)
    .limit(limit)

  if (error) throw new Error(error.message)

  const hashtagsWithCount = data?.map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    post_count: tag.post_hashtags?.[0]?.count || 0,
  })) || []

  return hashtagsWithCount as SearchHashtag[]
}
