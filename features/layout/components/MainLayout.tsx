'use client'

import * as React from 'react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
