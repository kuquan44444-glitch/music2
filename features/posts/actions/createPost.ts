'use server'

import { createClient } from '@/lib/supabase/server'
import { createPostSchema, CreatePostInput } from '@/lib/validations/post.schema'
import { parseHashtags } from '@/lib/utils'

export async function createPost(input: CreatePostInput & {
  images?: string[]
  videoUrl?: string
  musicData?: {
    title: string
    artist?: string
    fileUrl: string
    coverUrl?: string
  }
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Người dùng chưa đăng nhập')

  const validatedData = createPostSchema.parse({
    content: input.content,
    visibility: input.visibility,
  })

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: validatedData.content,
      visibility: validatedData.visibility,
    })
    .select()
    .single()

  if (postError) throw new Error(postError.message)

  if (input.images && input.images.length > 0) {
    const { error: imagesError } = await supabase
      .from('post_images')
      .insert(input.images.map((url) => ({
        post_id: post.id,
        image_url: url,
      })))

    if (imagesError) throw new Error(imagesError.message)
  }

  if (input.videoUrl) {
    const { error: videoError } = await supabase
      .from('post_videos')
      .insert({
        post_id: post.id,
        video_url: input.videoUrl,
        view_count: 0,
      })

    if (videoError) throw new Error(videoError.message)
  }

  if (input.musicData) {
    const { error: musicError } = await supabase
      .from('post_music')
      .insert({
        post_id: post.id,
        title: input.musicData.title,
        artist: input.musicData.artist,
        file_url: input.musicData.fileUrl,
        cover_url: input.musicData.coverUrl,
      })

    if (musicError) throw new Error(musicError.message)
  }

  if (input.content) {
    const hashtags = parseHashtags(input.content)
    for (const tag of hashtags) {
      const { data: hashtag, error: hashtagError } = await supabase
        .from('hashtags')
        .upsert({ name: tag }, { onConflict: 'name' })
        .select()
        .single()

      if (!hashtagError && hashtag) {
        await supabase
          .from('post_hashtags')
          .insert({
            post_id: post.id,
            hashtag_id: hashtag.id,
          })
      }
    }
  }

  return post
}
