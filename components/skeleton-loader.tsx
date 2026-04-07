'use client'

import { Card } from '@/components/ui/card'

export function SkeletonKPICard() {
  return (
    <Card className="p-4 sm:p-5 md:p-6 animate-fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 skeleton w-24 mb-3 rounded-md"></div>
          <div className="h-8 bg-gray-200 skeleton w-32 rounded-md"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 skeleton rounded-lg"></div>
      </div>
      <div className="h-3 bg-gray-200 skeleton w-20 rounded-md"></div>
    </Card>
  )
}

export function SkeletonChart() {
  return (
    <Card className="p-4 sm:p-5 md:p-6 animate-fade-in-up">
      <div className="h-6 bg-gray-200 skeleton w-32 mb-6 rounded-md"></div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 skeleton rounded-lg"></div>
      </div>
    </Card>
  )
}

export function SkeletonGauge() {
  return (
    <Card className="p-4 sm:p-5 md:p-6 animate-fade-in-up">
      <div className="h-4 bg-gray-200 skeleton w-24 mb-6 rounded-md"></div>
      <div className="flex justify-center mb-6">
        <div className="h-40 w-40 bg-gray-200 skeleton rounded-full"></div>
      </div>
      <div className="h-6 bg-gray-200 skeleton w-32 mx-auto rounded-md"></div>
    </Card>
  )
}

export function SkeletonAlertCard() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg animate-fade-in-up">
      <div className="flex gap-4">
        <div className="h-8 w-8 bg-gray-200 skeleton rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 skeleton w-40 mb-2 rounded-md"></div>
          <div className="h-4 bg-gray-200 skeleton w-full mb-3 rounded-md"></div>
          <div className="h-3 bg-gray-200 skeleton w-24 rounded-md"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 skeleton w-48 rounded-md"></div>
        <div className="h-4 bg-gray-200 skeleton w-64 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonChart key={i} />
        ))}
      </div>
    </div>
  )
}
