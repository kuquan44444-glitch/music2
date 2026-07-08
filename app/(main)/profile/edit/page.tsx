'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateProfileSchema, UpdateProfileInput } from '@/lib/validations/profile.schema'
import { useAuth } from '@/features/auth/AuthProvider'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Image from 'next/image'

const profileEditSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự').max(30).optional(),
  bio: z.string().max(500, 'Bio quá dài').optional(),
})

type ProfileEditInput = z.infer<typeof profileEditSchema>

export default function ProfileEditPage() {
  const { user } = useAuth()
  const { profile, isLoading, updateProfile } = useProfile(user?.id)
  const { addToast } = useToast()
  const [isSaving, setIsSaving] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
    },
  })

  React.useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileEditInput) => {
    setIsSaving(true)
    try {
      await updateProfile(data)
      addToast('Đã cập nhật thông tin', 'success')
    } catch (error) {
      addToast('Không thể cập nhật thông tin', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-4">
        <h1 className="text-2xl font-bold mb-6">Chỉnh sửa profile</h1>
        <div className="space-y-4">
          <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin hồ sơ của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile?.avatar_url}
                alt={profile?.full_name || profile?.username || ''}
                size="xl"
              />
              <div>
                <p className="font-semibold">{profile?.full_name || profile?.username}</p>
                <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Họ và tên</label>
              <Input
                {...register('full_name')}
                placeholder="Nhập họ và tên của bạn"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên người dùng</label>
              <Input
                {...register('username')}
                placeholder="Nhập tên người dùng"
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                {...register('bio')}
                placeholder="Viết giới thiệu về bạn..."
                className="min-h-32"
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Hủy
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
