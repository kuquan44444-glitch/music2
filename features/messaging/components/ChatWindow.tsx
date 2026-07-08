'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Send, Image as ImageIcon, MoreHorizontal, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn, formatTimeAgo, isImageFile } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { EmojiPickerButton } from '@/components/ui/EmojiPicker'
import { useAuth } from '@/features/auth/AuthProvider'
import { useMessages, useSendMessage, useMarkAsSeen, useRecallMessage, useRealtimeMessages } from '../hooks/useMessages'
import { MessageWithSender } from '../actions/messages'
import { createClient } from '@/lib/supabase/client'

const messageSchema = z.object({
  content: z.string().max(5000),
})

type MessageInput = z.infer<typeof messageSchema>

interface ChatWindowProps {
  conversationId: string
  otherUser: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  onBack?: () => void
}

export function ChatWindow({ conversationId, otherUser, onBack }: ChatWindowProps) {
  const { user } = useAuth()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId)
  const sendMessageMutation = useSendMessage()
  const markAsSeenMutation = useMarkAsSeen()
  const recallMutation = useRecallMessage()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string>('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
  })

  const content = watch('content')

  const messages = data?.pages.flatMap((page) => page.data) || []

  React.useEffect(() => {
    markAsSeenMutation.mutate(conversationId)
  }, [conversationId])

  useRealtimeMessages(conversationId, () => {
    markAsSeenMutation.mutate(conversationId)
  })

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const onSubmit = async (data: MessageInput) => {
    if (!data.content.trim() && !imageFile) return

    let imageUrl: string | undefined
    if (imageFile) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      const { error } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile, { upsert: false })

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }

    sendMessageMutation.mutate({
      conversationId,
      content: data.content || undefined,
      imageUrl,
    })

    reset()
    setImageFile(null)
    setImagePreview('')
  }

  const handleRecall = (messageId: string) => {
    if (confirm('Thu hồi tin nhắn này?')) {
      recallMutation.mutate(messageId)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 p-4 border-b border-border">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-accent rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Link href={`/profile/${otherUser.id}`} className="shrink-0">
          <Avatar
            src={otherUser.avatar_url}
            alt={otherUser.full_name || otherUser.username}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${otherUser.id}`} className="font-semibold hover:underline block truncate">
            {otherUser.full_name || otherUser.username}
          </Link>
          <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {isFetchingNextPage ? 'Đang tải...' : 'Tin nhắn cũ hơn'}
          </button>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              onRecall={() => handleRecall(message.id)}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <Image src={imagePreview} alt="Preview" width={100} height={100} className="rounded-lg object-cover" />
            <button
              onClick={() => {
                setImageFile(null)
                setImagePreview('')
              }}
              className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full"
            >
              <span className="text-white text-xs">×</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-accent rounded-full transition-colors shrink-0"
          >
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <div className="flex-1 relative">
            <Input
              {...register('content')}
              placeholder="Nhập tin nhắn..."
              className="pr-10"
            />
            <div className="absolute bottom-2.5 right-2">
              <EmojiPickerButton
                onEmojiSelect={(emoji) => setValue('content', content + emoji)}
              />
            </div>
          </div>
          
          <Button type="submit" size="icon" disabled={sendMessageMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  onRecall: () => void
}

function MessageBubble({ message, isOwn, onRecall }: MessageBubbleProps) {
  if (message.is_recalled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex gap-2',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <Avatar
          src={message.sender.avatar_url}
          alt={message.sender.full_name || message.sender.username}
          size="sm"
        />
        <div className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 bg-muted',
          isOwn && 'bg-primary text-primary-foreground'
        )}>
          <p className="text-sm italic text-muted-foreground">Tin nhắn đã được thu hồi</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-2',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isOwn && (
        <Link href={`/profile/${message.sender.id}`}>
          <Avatar
            src={message.sender.avatar_url}
            alt={message.sender.full_name || message.sender.username}
            size="sm"
          />
        </Link>
      )}
      
      <div className={cn('max-w-[70%]', isOwn && 'flex flex-col items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-2',
          isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
        )}>
          {message.image_url && (
            <Image
              src={message.image_url}
              alt="Message image"
              width={200}
              height={200}
              className="rounded-lg object-cover mb-2"
            />
          )}
          {message.text_content && (
            <p className="text-sm whitespace-pre-wrap">{message.text_content}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(message.created_at)}
          </span>
          {isOwn && (
            <Dropdown
              trigger={
                <button className="p-1 hover:bg-accent rounded-full">
                  <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                </button>
              }
              align="right"
            >
              <DropdownItem onClick={onRecall}>
                Thu hồi
              </DropdownItem>
            </Dropdown>
          )}
        </div>
      </div>
    </motion.div>
  )
}
