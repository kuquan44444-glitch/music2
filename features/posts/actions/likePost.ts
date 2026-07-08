'use server'

import { createClient } from '@/lib/supabase/server'

export async function likePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingLike) {
    return { alreadyLiked: true }
  }

  const { error } = await supabase
    .from('post_likes')
    .insert({
      post_id: postId,
      user_id: user.id,
    })

  if (error) throw new Error(error.message)

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (post && post.user_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        receiver_id: post.user_id,
        sender_id: user.id,
        type: 'like',
        post_id: postId,
      })
  }

  return { success: true }
}
