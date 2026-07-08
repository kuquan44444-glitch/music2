'use client'

import * as React from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Image as ImageIcon, Music, Video, Globe, Lock, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { EmojiPickerButton } from '@/components/ui/EmojiPicker'
import { createClient } from '@/lib/supabase/client'
import { createPost } from '../actions/createPost'
import { useToast } from '@/components/ui/Toast'

const postSchema = z.object({
  content: z.string().max(2000, 'Nội dung quá dài'),
  visibility: z.enum(['public', 'private']).default('public'),
})

type PostInput = z.infer<typeof postSchema>

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type PostType = 'text' | 'image' | 'video' | 'music'

export function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const [postType, setPostType] = React.useState<PostType>('text')
  const [images, setImages] = React.useState<File[]>([])
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([])
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [videoPreview, setVideoPreview] = React.useState<string>('')
  const [musicData, setMusicData] = React.useState({
    title: '',
    artist: '',
    coverFile: null as File | null,
    audioFile: null as File | null,
  })
  const [coverPreview, setCoverPreview] = React.useState<string>('')
  const [isUploading, setIsUploading] = React.useState(false)
  const { addToast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      visibility: 'public',
    },
  })

  const content = watch('content')

  const handleClose = () => {
    reset()
    setImages([])
    setImagePreviews([])
    setVideoFile(null)
    setVideoPreview('')
    setMusicData({ title: '', artist: '', coverFile: null, audioFile: null })
    setCoverPreview('')
    setPostType('text')
    onClose()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        addToast('Chỉ chấp nhận file hình ảnh', 'error')
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('Kích thước file quá lớn (tối đa 5MB)', 'error')
        return false
      }
      return true
    })

    if (validFiles.length + images.length > 10) {
      addToast('Tối đa 10 hình ảnh', 'error')
      return
    }

    setImages((prev) => [...prev, ...validFiles])
    
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      addToast('Chỉ chấp nhận file video', 'error')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      addToast('Kích thước video quá lớn (tối đa 50MB)', 'error')
      return
    }

    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const removeVideo = () => {
    setVideoFile(null)
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
      setVideoPreview('')
    }
  }

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      addToast('Chỉ chấp nhận file audio', 'error')
      return
    }

    setMusicData((prev) => ({ ...prev, audioFile: file }))
    e.target.value = ''
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Chỉ chấp nhận file hình ảnh', 'error')
      return
    }

    setMusicData((prev) => ({ ...prev, coverFile: file }))
    setCoverPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const uploadFile = async (file: File, bucket: string) => {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicUrl
  }

  const onSubmit = async (data: PostInput) => {
    setIsUploading(true)
    try {
      let uploadedImages: string[] = []
      let uploadedVideo: string | undefined
      let uploadedMusicData: { title: string; artist?: string; fileUrl: string; coverUrl?: string } | undefined

      if (images.length > 0) {
        for (const image of images) {
          const url = await uploadFile(image, 'post-images')
          uploadedImages.push(url)
        }
      }

      if (videoFile) {
        uploadedVideo = await uploadFile(videoFile, 'post-videos')
      }

      if (musicData.audioFile) {
        const fileUrl = await uploadFile(musicData.audioFile, 'music-files')
        let coverUrl: string | undefined
        
        if (musicData.coverFile) {
          coverUrl = await uploadFile(musicData.coverFile, 'music-covers')
        }

        uploadedMusicData = {
          title: musicData.title || 'Untitled',
          artist: musicData.artist || undefined,
          fileUrl,
          coverUrl,
        }
      }

      await createPost({
        content: data.content,
        visibility: data.visibility,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        videoUrl: uploadedVideo,
        musicData: uploadedMusicData,
      })

      addToast('Bài viết đã được đăng!', 'success')
      handleClose()
      onSuccess?.()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Không thể tạo bài viết', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setValue('content', content + emoji)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-xl">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Tạo bài viết mới</h2>

        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          {(['text', 'image', 'video', 'music'] as PostType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                postType === type
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {type === 'text' && 'Văn bản'}
              {type === 'image' && <ImageIcon className="h-4 w-4" />}
              {type === 'video' && <Video className="h-4 w-4" />}
              {type === 'music' && <Music className="h-4 w-4" />}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Textarea
              {...register('content')}
              placeholder="Bạn đang nghĩ gì?"
              className="min-h-32"
            />
            <div className="absolute bottom-3 right-3">
              <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>

          {postType === 'image' && (
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thêm hình ảnh</span>
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image src={preview} alt={`Preview ${i}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {postType === 'video' && (
            <div className="space-y-3">
              {!videoPreview ? (
                <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thêm video</span>
                </label>
              ) : (
                <div className="relative">
                  <video src={videoPreview} controls className="w-full rounded-xl max-h-64" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {postType === 'music' && (
            <div className="space-y-3 p-4 border rounded-xl">
              <div className="space-y-2">
                <Input
                  placeholder="Tên bài hát"
                  value={musicData.title}
                  onChange={(e) => setMusicData((prev) => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Nghệ sĩ"
                  value={musicData.artist}
                  onChange={(e) => setMusicData((prev) => ({ ...prev, artist: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {musicData.audioFile ? musicData.audioFile.name.slice(0, 20) : 'Chọn file nhạc'}
                  </span>
                </label>

                <label className="flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                  {coverPreview ? (
                    <div className="relative w-10 h-10">
                      <Image src={coverPreview} alt="Cover" fill className="object-cover rounded" />
                    </div>
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValue('visibility', 'public')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                  watch('visibility') === 'public'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <Globe className="h-4 w-4" />
                Công khai
              </button>
              <button
                type="button"
                onClick={() => setValue('visibility', 'private')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                  watch('visibility') === 'private'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <Lock className="h-4 w-4" />
                Riêng tư
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" isLoading={isUploading} className="flex-1">
              Đăng bài
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
