'use server'

import { createClient } from '@/lib/supabase/server'

export interface ConversationWithMember {
  id: string
  created_at: string
  last_message?: {
    text_content: string | null
    image_url: string | null
    created_at: string
    is_seen: boolean
    is_recalled: boolean
  }
  other_member: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  unread_count: number
}

export interface MessageWithSender {
  id: string
  conversation_id: string
  sender_id: string
  text_content: string | null
  image_url: string | null
  is_seen: boolean
  is_recalled: boolean
  created_at: string
  sender: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export async function getConversations(userId: string): Promise<ConversationWithMember[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      conversations!inner(
        id,
        created_at,
        messages(
          text_content,
          image_url,
          created_at,
          is_seen,
          is_recalled
        )
      )
    `)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  const conversations: ConversationWithMember[] = []

  for (const item of data || []) {
    const otherMember = await supabase
      .from('conversation_members')
      .select(`
        user_id,
        profiles!user_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', item.conversation_id)
      .neq('user_id', userId)
      .single()

    const lastMessage = (item.conversations as any)?.messages?.[0]
    const unreadCount = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', item.conversation_id)
      .neq('sender_id', userId)
      .eq('is_seen', false)

    conversations.push({
      id: item.conversation_id,
      created_at: (item.conversations as any).created_at,
      last_message: lastMessage ? {
        text_content: lastMessage.text_content,
        image_url: lastMessage.image_url,
        created_at: lastMessage.created_at,
        is_seen: lastMessage.is_seen,
        is_recalled: lastMessage.is_recalled,
      } : undefined,
      other_member: otherMember.data ? {
        id: otherMember.data.profiles.id,
        username: otherMember.data.profiles.username,
        full_name: otherMember.data.profiles.full_name,
        avatar_url: otherMember.data.profiles.avatar_url,
      } : { id: '', username: '', full_name: null, avatar_url: null },
      unread_count: unreadCount.count || 0,
    })
  }

  return conversations.sort((a, b) => {
    const dateA = a.last_message?.created_at || a.created_at
    const dateB = b.last_message?.created_at || b.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}

export async function getMessages(conversationId: string, cursor?: string, limit = 50) {
  const supabase = await createClient()
  
  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
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
    data: data?.reverse() as MessageWithSender[],
    nextCursor,
  }
}

export async function sendMessage(conversationId: string, content?: string, imageUrl?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  if (!content && !imageUrl) {
    throw new Error('Tin nhắn không được để trống')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text_content: content || null,
      image_url: imageUrl || null,
    })
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw new Error(error.message)

  const otherMembers = await supabase
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)

  for (const member of otherMembers.data || []) {
    await supabase
      .from('notifications')
      .insert({
        receiver_id: member.user_id,
        sender_id: user.id,
        type: 'message',
      })
  }

  return data
}

export async function markAsSeen(conversationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { error } = await supabase
    .from('messages')
    .update({ is_seen: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_seen', false)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function recallMessage(messageId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { error } = await supabase
    .from('messages')
    .update({ is_recalled: true })
    .eq('id', messageId)
    .eq('sender_id', user.id)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function createConversation(otherUserId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const existingConversation = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', user.id)

  for (const member of existingConversation.data || []) {
    const otherMembers = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', member.conversation_id)
      .eq('user_id', otherUserId)

    if (otherMembers.data && otherMembers.data.length > 0) {
      return { id: member.conversation_id }
    }
  }

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single()

  if (convError) throw new Error(convError.message)

  await supabase
    .from('conversation_members')
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: otherUserId },
    ])

  return conversation
}
