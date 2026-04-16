'use client'

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Download } from 'lucide-react'
import { useRealtimeEvents, useLiveData } from '@/lib/hooks/useFirebaseData'
import { useMemo } from 'react'

const COLORS = {
  EFFICIENT: '#22C55E',
  OVERLOAD: '#EF4444',
  UNDERUSAGE: '#06B6D4',
  IDLE: '#9CA3AF',
  MISSING: '#D1D5DB',
}

export default function AnalyticsPage() {
  const { events, totalCount } = useRealtimeEvents("device_01", 500)
  const { data: liveData } = useLiveData()

  // Calculate daily efficiency metrics
  const dailyMetrics = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const dayMap = new Map<string, {
      efficient: number
      overload: number
      underusage: number
      idle: number
      missing: number
      total: number
    }>()
    
    events.forEach((event) => {
      const date = new Date(event.event_time * 1000).toLocaleDateString()
      
      if (!dayMap.has(date)) {
        dayMap.set(date, {
          efficient: 0,
          overload: 0,
          underusage: 0,
          idle: 0,
          missing: 0,
          total: 0,
        })
      }
      
      const data = dayMap.get(date)!
      data.total += 1
      
      switch (event.status_type) {
        case 'EFFICIENT':
          data.efficient += 1
          break
        case 'OVERLOAD':
          data.overload += 1
          break
        case 'UNDERUSAGE':
          data.underusage += 1
          break
        case 'IDLE':
          data.idle += 1
          break
        case 'MISSING':
          data.missing += 1
          break
      }
    })
    
    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      efficiency: Math.round((data.efficient / data.total) * 100),
      overload: Math.round((data.overload / data.total) * 100),
      underusage: Math.round((data.underusage / data.total) * 100),
      idle: Math.round((data.idle / data.total) * 100),
    }))
  }, [events])

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const statusMap = new Map<string, number>()
    
    events.forEach((event) => {
      const status = event.status_type
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    
    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }, [events])

  // Hourly current trend
  const hourlyTrend = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const hourlyMap = new Map<number, { total: number; count: number; max: number }>()
    
    events.forEach((event) => {
      const date = new Date(event.event_time * 1000)
      const hour = date.getHours()
      
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { total: 0, count: 0, max: 0 })
      }
      
      const data = hourlyMap.get(hour)!
      data.total += event.current_value
      data.count += 1
      data.max = Math.max(data.max, event.current_value)
    })
    
    return Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        average: Math.round((data.total / data.count) * 100) / 100,
        max: data.max,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
  }, [events])

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 animate-fade-in-up">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Analytics & Insights</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Comprehensive analysis of motor operations</p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto touch-target">
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Export Report</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Events</h3>
          <p className="text-2xl font-bold text-foreground">{totalCount || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Efficient Events</h3>
          <p className="text-2xl font-bold text-green-500">
            {events?.filter(e => e.status_type === "EFFICIENT").length || 0}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Overload Events</h3>
          <p className="text-2xl font-bold text-red-500">
            {events?.filter(e => e.status_type === "OVERLOAD").length || 0}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Status</h3>
          <p className="text-2xl font-bold text-foreground">{liveData?.status || "UNKNOWN"}</p>
        </Card>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Hourly Current Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Hourly Current Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyTrend}>
              <defs>
                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#22C55E"
                fillOpacity={1}
                fill="url(#colorAverage)"
                name="Avg Current (A)"
              />
              <Line
                type="monotone"
                dataKey="max"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="Max Current (A)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Daily Efficiency Metrics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Efficiency Breakdown</h2>
        <Tabs defaultValue="efficiency" className="w-full">
          <TabsList>
            <TabsTrigger value="efficiency">Efficiency %</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="efficiency" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dailyMetrics}>
                <defs>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#22C55E"
                  fillOpacity={1}
                  fill="url(#colorEff)"
                  name="Efficiency %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="anomalies" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="overload" fill="#EF4444" name="Overload %" />
                <Bar dataKey="underusage" fill="#06B6D4" name="Underusage %" />
                <Bar dataKey="idle" fill="#9CA3AF" name="Idle %" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={events?.slice(-50).map(e => ({
                time: new Date(e.event_time * 1000).toLocaleTimeString(),
                current: e.current_value,
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="#FB923C" strokeWidth={2} name="Current (A)" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
