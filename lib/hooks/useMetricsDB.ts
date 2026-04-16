'use client'

import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '@/lib/firebase'

export interface TimeSeriesData {
  time: string
  consumption: number
}

export function useMetricsDB() {
  const [powerSeries, setPowerSeries] = useState<TimeSeriesData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const dbRef = ref(database, 'metrics/power_series')
    
    // Subscribe to Firebase real-time updates
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setPowerSeries(data)
      } else {
        setPowerSeries([])
      }
      setIsLoading(false)
    }, (error) => {
      console.error("Firebase Read Error:", error)
      setIsLoading(false)
    })

    // Clean up subscription on unmount
    return () => unsubscribe()
  }, [])

  return { powerSeries, isLoading }
}
