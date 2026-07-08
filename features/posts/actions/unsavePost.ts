'use server'

import { createClient } from '@/lib/supabase/server'

export async function unsavePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  return { success: true }
}
