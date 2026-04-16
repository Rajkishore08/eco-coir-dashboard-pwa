'use client'

import { Zap, Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLiveData, useDeviceInfo, useRealtimeEvents, useThresholdConfig } from '@/lib/hooks/useFirebaseData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

interface HistoricalData {
  time: string
  current: number
  timestamp: number
}

export default function LiveDashboard() {
  const { data: liveData, loading: liveLoading } = useLiveData()
  const { data: deviceInfo, loading: deviceLoading } = useDeviceInfo()
  const { data: thresholds } = useThresholdConfig()
  const { events, loading: eventsLoading } = useRealtimeEvents("device_01", 10)
  
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])

  useEffect(() => {
    if (liveData) {
      setHistoricalData(prev => {
        const newData = [...prev, {
          time: new Date(liveData.timestamp * 1000).toLocaleTimeString(),
          current: liveData.current,
          timestamp: liveData.timestamp
        }]
        return newData.slice(-20)
      })
    }
  }, [liveData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EFFICIENT': return 'text-green-600 bg-green-50 border-green-200'
      case 'OVERLOAD': return 'text-red-600 bg-red-50 border-red-200'
      case 'UNDERUSAGE': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'IDLE': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'MISSING': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EFFICIENT': return <CheckCircle className="h-5 w-5" />
      case 'OVERLOAD': return <AlertTriangle className="h-5 w-5" />
      case 'UNDERUSAGE': return <Activity className="h-5 w-5" />
      case 'IDLE': return <Clock className="h-5 w-5" />
      case 'MISSING': return <XCircle className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const calculatePowerConsumption = (current: number) => {
    const voltage = 415
    const powerFactor = 0.85
    return ((current * voltage * Math.sqrt(3) * powerFactor) / 1000).toFixed(2)
  }

  if (liveLoading || deviceLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Connecting to Firebase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2">
          Live IoT Dashboard
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Real-time data from Firebase Realtime Database
        </p>
      </div>

      {/* Device Info Banner */}
      {deviceInfo && (
        <Card className="animate-fade-in-up border-2" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{deviceInfo.device_name}</h2>
                <p className="text-muted-foreground">Location: {deviceInfo.location}</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold ${
                deviceInfo.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {deviceInfo.status}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Metrics */}
      {liveData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Draw</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveData.current.toFixed(2)} A</div>
              <p className="text-xs text-muted-foreground mt-1">
                Power: {calculatePowerConsumption(liveData.current)} kW
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 ${getStatusColor(liveData.status)}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Machine Status</CardTitle>
              {getStatusIcon(liveData.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveData.status}</div>
              <p className="text-xs mt-1">
                Updated: {new Date(liveData.timestamp * 1000).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {thresholds && liveData.current > 0 ? (
                <>
                  <div className="text-3xl font-bold">
                    {Math.min(100, ((liveData.current / thresholds.overload_limit) * 100)).toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: 25-{thresholds.overload_limit} A
                  </p>
                </>
              ) : (
                <div className="text-3xl font-bold">--</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Chart */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Current Draw - Last 2 Minutes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
              {thresholds && historicalData.length > 0 && (
                <>
                  <Line 
                    type="monotone" 
                    data={historicalData.map(() => ({ value: thresholds.overload_limit }))}
                    dataKey="value"
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    dot={false}
                    name="Overload Limit"
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    data={historicalData.map(() => ({ value: thresholds.underusage_limit }))}
                    dataKey="value"
                    stroke="#f59e0b" 
                    strokeDasharray="5 5"
                    dot={false}
                    name="Underusage Limit"
                    isAnimationActive={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>Recent Machine Events</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 border-2 rounded-lg ${getStatusColor(event.status_type)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-white/50">
                      {getStatusIcon(event.status_type)}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{event.status_type}</p>
                      <p className="text-sm">
                        Current: {event.current_value.toFixed(2)} A • Duration: {event.duration}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(event.event_time * 1000).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.event_time * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No events recorded yet</p>
              <p className="text-sm">Events will appear as the system operates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thresholds Info */}
      {thresholds && (
        <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle>System Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Overload Limit</p>
                <p className="text-2xl font-bold text-red-700">{thresholds.overload_limit} A</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Underusage Limit</p>
                <p className="text-2xl font-bold text-yellow-700">{thresholds.underusage_limit} A</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Idle Threshold</p>
                <p className="text-2xl font-bold text-gray-700">{thresholds.idle_threshold} A</p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Missing Timeout</p>
                <p className="text-2xl font-bold text-orange-700">{thresholds.missing_timeout}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
