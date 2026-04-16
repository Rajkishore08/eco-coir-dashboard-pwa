'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { useLiveData, useRealtimeEvents } from '@/lib/hooks/useFirebaseData'
import { Zap, Gauge, Leaf, Activity } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { GaugeWidget } from '@/components/gauge-widget'
import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

const STATUS_COLORS = {
  EFFICIENT: '#22C55E',
  OVERLOAD: '#F59E0B',
  UNDERUSAGE: '#06B6D4',
  IDLE: '#9CA3AF',
  MISSING: '#D1D5DB',
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const { data: liveData, loading } = useLiveData()
  const { events, totalCount } = useRealtimeEvents("device_01", 500)

  // Calculate efficiency distribution
  const efficiencyData = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const statusMap = new Map<string, number>()
    
    events.forEach((event) => {
      const status = event.status_type
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    
    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#9CA3AF',
    }))
  }, [events])

  // Calculate hourly current data
  const hourlyCurrentData = useMemo(() => {
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
        current: Math.round((data.total / data.count) * 100) / 100,
      }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time))
  }, [events])

  // Calculate efficiency percentage
  const efficiencyPercentage = useMemo(() => {
    if (!events || events.length === 0) return 0
    const efficientCount = events.filter(e => e.status_type === "EFFICIENT").length
    return Math.round((efficientCount / events.length) * 100)
  }, [events])
  
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Dynamic Page Header */}
      <div className="animate-fade-in-up bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-green-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 mb-2 tracking-tight">
            Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Operator'}!
          </h1>
          <p className="text-base sm:text-lg text-green-600 font-medium">Here's your EcoCoir smart factory overview for today.</p>
        </div>
        <div className="flex bg-green-50 p-3 rounded-lg border border-green-100 items-center justify-center">
          <Leaf className="text-green-500 w-8 h-8 mr-3 animate-pulse" />
          <div>
            <p className="text-xs text-green-700 font-bold uppercase">System Status</p>
            <p className="text-lg text-green-800 font-bold">
              {loading ? "Loading..." : liveData?.status || "Unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Enhanced UX with Visual Hierarchy */}
      <div className="space-y-4 md:space-y-6">
        {/* Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <KPICard
            title="System Efficiency Score"
            value={loading ? 0 : efficiencyPercentage}
            unit="%"
            icon={Activity}
            colorScheme="lime"
            status="normal"
            delay={0}
          />
          <KPICard
            title="Operational Status"
            value={loading ? "Loading" : liveData?.status || "Unknown"}
            icon={Leaf}
            colorScheme={liveData?.status === "EFFICIENT" ? "green" : liveData?.status === "OVERLOAD" ? "red" : "cyan"}
            status="normal"
            delay={1}
          />
        </div>
        
        {/* Secondary Detailed KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <KPICard
            title="Current Draw"
            value={loading ? 0 : liveData?.current || 0}
            unit="A"
            icon={Zap}
            colorScheme="amber"
            status="normal"
            delay={2}
          />
          <KPICard
            title="Total Events Logged"
            value={totalCount || 0}
            unit="events"
            icon={Gauge}
            colorScheme="cyan"
            status="normal"
            delay={3}
          />
        </div>
      </div>

      {/* Charts Section - Full Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Hourly Current Chart */}
        <Card className="p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Hourly Current Consumption (A)</h2>
          <ResponsiveContainer width="100%" height={250}>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500 animate-pulse">Loading data from Firebase...</span>
              </div>
            ) : (
              <LineChart data={hourlyCurrentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235)" />
                <XAxis dataKey="time" stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(255 255 255)', border: '2px solid rgb(34 197 94)', borderRadius: '8px' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={false}
                  name="Current (A)"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Efficiency Distribution */}
        <Card className="p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500 animate-pulse">Loading data from Firebase...</span>
              </div>
            ) : (
              <PieChart>
                <Pie
                  data={efficiencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Real-time Gauges */}
      <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Real-time Monitoring</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <GaugeWidget 
            title="Current Draw" 
            value={loading ? 0 : liveData?.current || 0} 
            maxValue={50}
            unit="A"
            color="#FB923C"
          />
          <GaugeWidget 
            title="System Efficiency" 
            value={loading ? 0 : efficiencyPercentage} 
            maxValue={100}
            unit="%"
            color="#22C55E"
          />
          <GaugeWidget 
            title="Machine Load" 
            value={loading ? 0 : liveData?.status === "EFFICIENT" ? 80 : liveData?.status === "OVERLOAD" ? 95 : liveData?.status === "UNDERUSAGE" ? 40 : liveData?.status === "IDLE" ? 0 : liveData?.status === "MISSING" ? 0 : 0} 
            maxValue={100}
            unit="%"
            color="#06B6D4"
          />
        </div>
      </div>

      {/* Recent Events */}
      <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Events</h2>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <span className="text-muted-foreground animate-pulse">Loading events...</span>
            </div>
          ) : events && events.length > 0 ? (
            events.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{event.status_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.event_time * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{event.current_value} A</p>
                  <p className="text-sm text-muted-foreground">{event.duration}s</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events recorded yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
