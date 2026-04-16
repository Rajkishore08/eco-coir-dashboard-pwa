'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, set, push, update } from 'firebase/database'
import { database } from '@/lib/firebase'

export interface Alert {
  id: string
  type: 'overload' | 'underusage' | 'sensor' | 'maintenance' | 'system'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string | number
  status: 'active' | 'resolved'
  actionRequired: boolean
}

// Initial mock data to seed if db is completely empty
const initialAlerts: Record<string, Omit<Alert, 'id'>> = {
  'mock1': {
    type: 'overload',
    severity: 'critical',
    title: 'Machine Overload Detected',
    description: 'Line 2 load exceeded safe threshold (95%). Conveyor belt stopped for 8 seconds.',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    status: 'active',
    actionRequired: true,
  },
  'mock2': {
    type: 'maintenance',
    severity: 'warning',
    title: 'Preventive Maintenance Due',
    description: 'Machine 3 maintenance scheduled in 48 hours. Please plan downtime.',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    status: 'active',
    actionRequired: true,
  },
  'mock3': {
    type: 'underusage',
    severity: 'info',
    title: 'Low Machine Utilization',
    description: 'Line 1 operating at 35% capacity. Consider increasing feed rate.',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    status: 'active',
    actionRequired: false,
  }
}

export function useAlertsDB() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const dbRef = ref(database, 'metrics/alerts')
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        // Convert object map back to array and sort by most recent timestamp
        const parsedAlerts: Alert[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
        
        setAlerts(parsedAlerts)
      } else {
        // Auto-seed if database is completely empty
        set(dbRef, initialAlerts)
      }
      setIsLoading(false)
    }, (error) => {
      console.error("Firebase Alert sync error:", error)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addAlert = async (newAlert: Omit<Alert, 'id' | 'timestamp' | 'status'>) => {
    try {
      const dbRef = ref(database, 'metrics/alerts')
      const newAlertRef = push(dbRef)
      await set(newAlertRef, {
        ...newAlert,
        timestamp: Date.now(),
        status: 'active'
      })
    } catch (e) {
      console.error('Failed to add alert', e)
      throw e
    }
  }

  const resolveAlert = async (id: string) => {
    try {
      const dbRef = ref(database, `metrics/alerts/${id}`)
      await update(dbRef, { status: 'resolved' })
    } catch (e) {
      console.error('Failed to resolve alert', e)
    }
  }

  return { alerts, isLoading, addAlert, resolveAlert }
}
