import { createClient } from '@/lib/supabase/server'
import { createCommentSchema, CreateCommentInput } from '@/lib/validations/post.schema'

export async function addComment(input: CreateCommentInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const validatedData = createCommentSchema.parse(input)

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_id: validatedData.postId,
      user_id: user.id,
      parent_id: validatedData.parentId,
      content: validatedData.content,
    })
    .select(`
      *,
      profiles!inner(id, username, full_name, avatar_url)
    `)
    .single()

  if (error) throw new Error(error.message)

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', validatedData.postId)
    .single()

  if (post && post.user_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        receiver_id: post.user_id,
        sender_id: user.id,
        type: validatedData.parentId ? 'reply' : 'comment',
        post_id: validatedData.postId,
      })
  }

  return comment
}
