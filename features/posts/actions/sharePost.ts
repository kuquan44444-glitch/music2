'use server'

import { createClient } from '@/lib/supabase/server'

export async function sharePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!post) throw new Error('Bài viết không tồn tại')

  if (post.user_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        receiver_id: post.user_id,
        sender_id: user.id,
        type: 'share',
        post_id: postId,
      })
  }

  return { success: true }
}
