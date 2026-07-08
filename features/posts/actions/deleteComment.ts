'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment) throw new Error('Bình luận không tồn tại')
  if (comment.user_id !== user.id) throw new Error('Bạn không có quyền xóa bình luận này')

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw new Error(error.message)

  return { success: true }
}
