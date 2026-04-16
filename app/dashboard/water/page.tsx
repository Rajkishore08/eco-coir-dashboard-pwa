'use client'

import { Droplets } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function WaterUsagePage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Water Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Water sensor not installed</p>
      </div>

      {/* Not Available Message */}
      <Card className="p-12 text-center">
        <Droplets className="h-20 w-20 mx-auto mb-6 text-gray-300" />
        <h2 className="text-3xl font-bold text-gray-700 mb-3">Water Monitoring Not Available</h2>
        <p className="text-lg text-gray-500 mb-2">Water flow sensor has not been installed in the system yet.</p>
        <p className="text-muted-foreground">This feature will be available once the water monitoring hardware is deployed.</p>
      </Card>
    </div>
  )
}
