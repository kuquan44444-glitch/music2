'use server'

import { createClient } from '@/lib/supabase/server'

export async function savePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: existing } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { alreadySaved: true }
  }

  const { error } = await supabase
    .from('saved_posts')
    .insert({
      post_id: postId,
      user_id: user.id,
    })

  if (error) throw new Error(error.message)

  return { success: true }
}
