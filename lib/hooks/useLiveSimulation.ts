'use client'

import { useState, useEffect } from 'react'

export function useLiveSimulation() {
  const [metrics, setMetrics] = useState({
    efficiency: 87.5,
    powerConsumption: 15240,
    waterUsage: 28500,
    machineLoad: 81.4,
    powerUsageGauge: 76,
    waterFlowGauge: 64,
    systemTemp: 45,
  })

  useEffect(() => {
    // Helper to generate a random drift
    const updateValue = (current: number, base: number, maxDrift: number, isCumulative = false) => {
      if (isCumulative) {
        // Accumulative values (like total power/water) generally go up, with occasional drops or static
        return current + Math.max(0, (Math.random() - 0.2) * maxDrift)
      } else {
        // Fluctuating values bounce gently around their base
        const drift = (Math.random() - 0.5) * maxDrift
        // Constrain so they don't wander into oblivion
        const newValue = current + drift
        if (Math.abs(newValue - base) > maxDrift * 3) {
          return current - drift * 1.5 // bounce back
        }
        return newValue
      }
    }

    const intervalId = setInterval(() => {
      setMetrics((prev) => ({
        efficiency: Number(updateValue(prev.efficiency, 87.5, 0.8).toFixed(1)),
        powerConsumption: Number(updateValue(prev.powerConsumption, 15240, 15, true).toFixed(0)),
        waterUsage: Number(updateValue(prev.waterUsage, 28500, 25, true).toFixed(0)),
        machineLoad: Number(updateValue(prev.machineLoad, 81.4, 2.5).toFixed(1)),
        powerUsageGauge: Number(updateValue(prev.powerUsageGauge, 76, 3).toFixed(1)),
        waterFlowGauge: Number(updateValue(prev.waterFlowGauge, 64, 4).toFixed(1)),
        systemTemp: Number(updateValue(prev.systemTemp, 45, 1.5).toFixed(1)),
      }))
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return metrics
}
