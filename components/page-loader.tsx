'use client'

import { Suspense, ReactNode } from 'react'
import { SkeletonDashboardPage } from '@/components/skeleton-loader'

interface PageLoaderProps {
  children: ReactNode
}

export function PageLoader({ children }: PageLoaderProps) {
  return (
    <Suspense fallback={<SkeletonDashboardPage />}>
      {children}
    </Suspense>
  )
}
