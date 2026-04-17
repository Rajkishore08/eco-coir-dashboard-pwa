'use client'

import { Droplets, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function WaterUsagePage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Water Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Real-time water flow monitoring</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="p-16 text-center border-green-100 bg-gradient-to-br from-green-50/50 to-white">
        {/* Animated Water Drop Icon */}
        <Droplets className="h-20 w-20 mx-auto mb-6 text-green-500 animate-bounce" />

        {/* Content */}
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Water Monitoring System
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-4">
          Real-time water flow monitoring system is being integrated into the EcoCoir smart factory.
        </p>
        <p className="text-base text-gray-500 max-w-lg mx-auto mb-8">
          Track water consumption, optimize usage, and ensure sustainable coir processing operations.
        </p>

        {/* Coming Soon Badge at Bottom */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full font-bold text-base shadow-lg">
          <Sparkles className="w-5 h-5" />
          <span>COMING SOON</span>
          <Sparkles className="w-5 h-5" />
        </div>
      </Card>
    </div>
  )
}
