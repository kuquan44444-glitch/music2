'use server'

import { createClient } from '@/lib/supabase/server'

export interface NotificationWithSender {
  id: string
  receiver_id: string
  sender_id: string | null
  type: 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accepted' | 'message' | 'share'
  post_id: string | null
  is_read: boolean
  created_at: string
  sender: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export async function getNotifications(userId: string, cursor?: string, limit = 20) {
  const supabase = await createClient()
  
  let query = supabase
    .from('notifications')
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  let nextCursor: string | undefined
  if (data && data.length > limit) {
    const nextItem = data.pop()
    nextCursor = nextItem?.created_at
  }

  return {
    data: data as NotificationWithSender[],
    nextCursor,
  }
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function markAllAsRead(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) throw new Error(error.message)

  return count || 0
}
