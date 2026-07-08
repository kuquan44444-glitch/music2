'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadAvatar(userId: string, file: File) {
  const supabase = await createClient()
  
  const fileName = `${userId}/avatar_${Date.now()}`
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)

  if (updateError) throw new Error(updateError.message)

  return publicUrl
}

export async function uploadCover(userId: string, file: File) {
  const supabase = await createClient()
  
  const fileName = `${userId}/cover_${Date.now()}`
  
  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('covers')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ cover_url: publicUrl })
    .eq('id', userId)

  if (updateError) throw new Error(updateError.message)

  return publicUrl
}
