'use server'

import { createClient } from '@/lib/supabase/server'
import { updatePostSchema, UpdatePostInput } from '@/lib/validations/post.schema'

export async function updatePost(input: UpdatePostInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const { data: existingPost } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', input.postId)
    .single()

  if (!existingPost) throw new Error('Bài viết không tồn tại')
  if (existingPost.user_id !== user.id) throw new Error('Bạn không có quyền chỉnh sửa bài viết này')

  const validatedData = updatePostSchema.parse(input)

  const { data, error } = await supabase
    .from('posts')
    .update({
      content: validatedData.content,
      visibility: validatedData.visibility,
    })
    .eq('id', input.postId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data
}
