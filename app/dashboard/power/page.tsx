'use client'

import { Zap, Gauge, TrendingUp, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { KPICard } from '@/components/kpi-card'
import { GaugeWidget } from '@/components/gauge-widget'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLiveData, useRealtimeEvents } from '@/lib/hooks/useFirebaseData'
import { useMemo } from 'react'

export default function PowerManagementPage() {
  const { data: liveData, loading } = useLiveData()
  const { events, totalCount } = useRealtimeEvents("device_01", 100)

  // Process events to create hourly consumption data
  const hourlyData = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const hourlyMap = new Map<number, { total: number; count: number }>()
    
    events.forEach((event) => {
      const date = new Date(event.event_time * 1000)
      const hour = date.getHours()
      
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { total: 0, count: 0 })
      }
      
      const data = hourlyMap.get(hour)!
      data.total += event.current_value
      data.count += 1
    })
    
    return Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        time: `${hour.toString().padStart(2, '0')}:00`,
        consumption: Math.round((data.total / data.count) * 100) / 100,
      }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time))
  }, [events])

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const statusMap = new Map<string, number>()
    
    events.forEach((event) => {
      const status = event.status_type
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }))
  }, [events])

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Power Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor motor current consumption and efficiency</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <KPICard
          title="Current Draw"
          value={loading ? 0 : liveData?.current || 0}
          unit="A"
          icon={Zap}
          status="normal"
          colorScheme="amber"
        />
        <KPICard
          title="Machine Status"
          value={loading ? "LOADING" : liveData?.status || "UNKNOWN"}
          icon={Activity}
          status="normal"
          colorScheme={liveData?.status === "EFFICIENT" ? "green" : liveData?.status === "OVERLOAD" ? "red" : "cyan"}
        />
        <KPICard
          title="Total Events"
          value={totalCount || 0}
          unit="events"
          icon={Gauge}
          status="normal"
          colorScheme="cyan"
        />
      </div>

      {/* Real-time Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GaugeWidget
          title="Current Draw"
          value={loading ? 0 : liveData?.current || 0}
          maxValue={50}
          unit="A"
          color="#FB923C"
        />
        <GaugeWidget
          title="Efficiency"
          value={loading ? 0 : liveData?.status === "EFFICIENT" ? 95 : liveData?.status === "OVERLOAD" ? 60 : liveData?.status === "UNDERUSAGE" ? 35 : liveData?.status === "IDLE" ? 0 : liveData?.status === "MISSING" ? 0 : 0}
          maxValue={100}
          unit="%"
          color="#22C55E"
        />
      </div>

      {/* Main Charts */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Consumption Analysis</h2>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList>
            <TabsTrigger value="hourly">Hourly Average</TabsTrigger>
            <TabsTrigger value="events">Event Timeline</TabsTrigger>
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
          </TabsList>

          {/* Hourly Average */}
          <TabsContent value="hourly" className="mt-4">
            {loading ? (
              <div className="h-[350px] flex items-center justify-center">
                <span className="text-muted-foreground animate-pulse">Loading data...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="consumption" stroke="#FB923C" fillOpacity={1} fill="url(#colorCurrent)" name="Current (A)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          {/* Event Timeline */}
          <TabsContent value="events" className="mt-4">
            {loading ? (
              <div className="h-[350px] flex items-center justify-center">
                <span className="text-muted-foreground animate-pulse">Loading events...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={events?.slice(0, 50).reverse().map(e => ({
                  time: new Date(e.event_time * 1000).toLocaleTimeString(),
                  current: e.current_value,
                  status: e.status_type
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="current" stroke="#FB923C" strokeWidth={2} name="Current (A)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          {/* Status Distribution */}
          <TabsContent value="status" className="mt-4">
            {loading ? (
              <div className="h-[350px] flex items-center justify-center">
                <span className="text-muted-foreground animate-pulse">Loading status data...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#22C55E" name="Event Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Current Status</span>
              <span className="font-semibold text-foreground">{liveData?.status || "UNKNOWN"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Current Draw</span>
              <span className="font-semibold text-amber-500">{liveData?.current || 0} A</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Total Events</span>
              <span className="font-semibold text-blue-500">{totalCount || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Efficiency Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Efficient Events</span>
              <span className="font-semibold text-green-500">
                {events?.filter(e => e.status_type === "EFFICIENT").length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Overload Events</span>
              <span className="font-semibold text-red-500">
                {events?.filter(e => e.status_type === "OVERLOAD").length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Idle Events</span>
              <span className="font-semibold text-gray-500">
                {events?.filter(e => e.status_type === "IDLE").length || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
