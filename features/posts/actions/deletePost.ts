'use server'

import { createClient } from '@/lib/supabase/server'

export async function deletePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: existingPost } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!existingPost) throw new Error('Bài viết không tồn tại')
  if (existingPost.user_id !== user.id) throw new Error('Bạn không có quyền xóa bài viết này')

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw new Error(error.message)

  return { success: true }
}
