'use client'

import * as React from 'react'
import { SearchBar, SearchResults } from '@/features/search/components/SearchBar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useSearch } from '@/features/search/hooks/useSearch'

export default function SearchPage() {
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState<'all' | 'users' | 'posts' | 'hashtags'>('all')

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Tìm kiếm</h1>
      
      <div className="space-y-4">
        <SearchBar onSearch={setQuery} />
        
        {query.length >= 2 && (
          <>
            <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="users">Người dùng</TabsTrigger>
                <TabsTrigger value="posts">Bài viết</TabsTrigger>
                <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <SearchResults query={query} type={type} />
          </>
        )}
      </div>
    </div>
  )
}
