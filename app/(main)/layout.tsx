import { Providers } from '../providers'
import { MainLayout } from '@/features/layout'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <MainLayout>
        {children}
      </MainLayout>
    </Providers>
  )
}
