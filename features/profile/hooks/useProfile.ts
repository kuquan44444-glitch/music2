'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getProfile, updateProfile } from '../actions/getProfile'
import { uploadAvatar, uploadCover } from '../actions/uploadMedia'
import { Profile } from '@/types/database.types'
import { useToast } from '@/components/ui/Toast'

export function useProfile(userId: string | undefined) {
  const { addToast } = useToast()
  
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  })

  const updateMutation = updateProfile

  const uploadAvatarMutation = async (file: File) => {
    if (!userId) return
    try {
      await uploadAvatar(userId, file)
      addToast('Đã cập nhật ảnh đại diện', 'success')
      refetch()
    } catch (error) {
      addToast('Không thể tải lên ảnh đại diện', 'error')
      throw error
    }
  }

  const uploadCoverMutation = async (file: File) => {
    if (!userId) return
    try {
      await uploadCover(userId, file)
      addToast('Đã cập nhật ảnh bìa', 'success')
      refetch()
    } catch (error) {
      addToast('Không thể tải lên ảnh bìa', 'error')
      throw error
    }
  }

  const updateProfileMutation = async (updates: { full_name?: string; username?: string; bio?: string }) => {
    if (!userId) return
    try {
      await updateProfile(userId, updates)
      addToast('Đã cập nhật thông tin', 'success')
      refetch()
    } catch (error) {
      addToast('Không thể cập nhật thông tin', 'error')
      throw error
    }
  }

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation,
    uploadAvatar: uploadAvatarMutation,
    uploadCover: uploadCoverMutation,
  }
}
