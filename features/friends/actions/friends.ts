import { createClient } from '@/lib/supabase/server'

export async function getFriends(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('friends')
    .select(`
      id,
      created_at,
      friend_id,
      profiles!friend_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const friends = data?.map((d) => {
    const friend = d.friend_id === userId 
      ? (d as any).profiles 
      : (d as any).profiles
    return {
      id: d.id,
      friendId: d.friend_id,
      ...friend,
      created_at: d.created_at,
    }
  }) || []

  return friends
}

export async function getFriendRequests(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      id,
      sender_id,
      receiver_id,
      status,
      created_at,
      profiles!sender_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data || []
}

export async function sendFriendRequest(receiverId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase
    .from('notifications')
    .insert({
      receiver_id: receiverId,
      sender_id: user.id,
      type: 'friend_request',
    })

  return data
}

export async function acceptFriendRequest(requestId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: request } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id')
    .eq('id', requestId)
    .single()

  if (!request) throw new Error('Yêu cầu không tồn tại')

  await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  await supabase
    .from('friends')
    .insert([
      { user_id: request.sender_id, friend_id: request.receiver_id },
      { user_id: request.receiver_id, friend_id: request.sender_id },
    ])

  await supabase
    .from('notifications')
    .insert({
      receiver_id: request.sender_id,
      sender_id: user.id,
      type: 'friend_accepted',
    })

  return { success: true }
}

export async function rejectFriendRequest(requestId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function cancelFriendRequest(receiverId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('sender_id', user.id)
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function unfriend(friendId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

  return { success: true }
}

export async function checkFriendStatus(userId: string, otherUserId: string) {
  const supabase = await createClient()
  
  const { data: friend } = await supabase
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`)
    .single()

  if (friend) return { isFriend: true }

  const { data: request } = await supabase
    .from('friend_requests')
    .select('id, sender_id, receiver_id, status')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .eq('status', 'pending')
    .single()

  if (request) {
    if (request.sender_id === userId) {
      return { isFriend: false, requestSent: true, requestId: request.id }
    }
    return { isFriend: false, requestReceived: true, requestId: request.id }
  }

  return { isFriend: false }
}
