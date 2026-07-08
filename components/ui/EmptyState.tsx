'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { FileQuestion, Search, Inbox, Users } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'search' | 'inbox' | 'users' | 'question' | 'custom'
  customIcon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon = 'question',
  customIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const icons = {
    search: Search,
    inbox: Inbox,
    users: Users,
    question: FileQuestion,
    custom: null,
  }

  const Icon = icon !== 'custom' ? icons[icon] : null

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {customIcon || (Icon && <Icon className="h-8 w-8 text-muted-foreground" />)}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
