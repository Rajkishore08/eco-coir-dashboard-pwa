'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { useLiveSimulation } from '@/lib/hooks/useLiveSimulation'
import { useMetricsDB } from '@/lib/hooks/useMetricsDB'
import { Zap, Droplets, Gauge, Leaf, Activity } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { GaugeWidget } from '@/components/gauge-widget'
import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Fetch dynamic data from React Database Hook natively

const machineLoadData = [
  { time: '00:00', load: 65 },
  { time: '04:00', load: 72 },
  { time: '08:00', load: 85 },
  { time: '12:00', load: 78 },
  { time: '16:00', load: 88 },
  { time: '20:00', load: 92 },
  { time: '23:59', load: 68 },
]

const waterUsageData = [
  { time: 'Mon', usage: 4000 },
  { time: 'Tue', usage: 4200 },
  { time: 'Wed', usage: 3800 },
  { time: 'Thu', usage: 4100 },
  { time: 'Fri', usage: 4500 },
  { time: 'Sat', usage: 3900 },
  { time: 'Sun', usage: 4300 },
]

const efficiencyData = [
  { name: 'Efficient', value: 65, fill: '#22C55E' },
  { name: 'Overload', value: 20, fill: '#F59E0B' },
  { name: 'Underutilized', value: 10, fill: '#06B6D4' },
  { name: 'Missing Data', value: 5, fill: '#D1D5DB' },
]

export default function DashboardOverview() {
  const { user } = useAuth()
  const liveMetrics = useLiveSimulation()
  const { powerSeries, isLoading } = useMetricsDB()
  
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
            <p className="text-lg text-green-800 font-bold">Optimal running</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Enhanced UX with Visual Hierarchy */}
      <div className="space-y-4 md:space-y-6">
        {/* Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <KPICard
            title="System Efficiency Score"
            value={liveMetrics.efficiency}
            unit="%"
            icon={Activity}
            colorScheme="lime"
            trend={{ value: 5, isPositive: true }}
            status="normal"
            delay={0}
          />
          <KPICard
            title="Operational Status"
            value="Active"
            icon={Leaf}
            colorScheme="green"
            status="normal"
            delay={1}
          />
        </div>
        
        {/* Secondary Detailed KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <KPICard
            title="Total Power Consumption"
            value={liveMetrics.powerConsumption}
            unit="kWh"
            icon={Zap}
            colorScheme="amber"
            trend={{ value: 12, isPositive: true }}
            status="normal"
            delay={2}
          />
          <KPICard
            title="Water Usage Today"
            value={liveMetrics.waterUsage}
            unit="L"
            icon={Droplets}
            colorScheme="cyan"
            trend={{ value: 8, isPositive: false }}
            status="normal"
            delay={3}
          />
          <KPICard
            title="Average Machine Load"
            value={liveMetrics.machineLoad}
            unit="%"
            icon={Gauge}
            colorScheme="green"
            trend={{ value: 3, isPositive: true }}
            status="normal"
            delay={4}
          />
        </div>
      </div>

      {/* Charts Section - Full Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Power Consumption Chart */}
        <Card className="p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Power Consumption (W)</h2>
          <ResponsiveContainer width="100%" height={200}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500 animate-pulse">Syncing Database...</span>
              </div>
            ) : (
              <LineChart data={powerSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235)" />
              <XAxis dataKey="time" stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(255 255 255)', border: '2px solid rgb(34 197 94)', borderRadius: '8px' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="#22C55E"
                strokeWidth={3}
                dot={false}
                name="Power (kWh)"
              />
            </LineChart>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Machine Load Chart */}
        <Card className="p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Machine Load Status (%)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={machineLoadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235)" />
              <XAxis dataKey="time" stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(255 255 255)', border: '2px solid rgb(6 182 212)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="load" fill="#06B6D4" radius={[12, 12, 0, 0]} name="Load %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Water Usage Chart */}
        <Card className="p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Weekly Water Usage (L)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={waterUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235)" />
              <XAxis dataKey="time" stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgb(107 114 128)" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(255 255 255)', border: '2px solid rgb(132 204 22)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="usage" fill="#84CC16" radius={[12, 12, 0, 0]} name="Usage (L)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Efficiency Distribution */}
        <Card className="p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Efficiency Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={efficiencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {efficiencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Real-time Gauges */}
      <div className="animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Real-time Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <GaugeWidget title="Machine Load" value={liveMetrics.machineLoad} colorScheme="green" delay={0} />
          <GaugeWidget title="Power Usage" value={liveMetrics.powerUsageGauge} colorScheme="cyan" delay={1} />
          <GaugeWidget title="Water Flow" value={liveMetrics.waterFlowGauge} colorScheme="lime" delay={2} />
          <GaugeWidget title="System Temp" value={liveMetrics.systemTemp} maxValue={100} colorScheme="amber" delay={3} />
        </div>
      </div>

      {/* Detailed Metrics */}
      <Card className="p-3 sm:p-4 md:p-6 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Daily Analytics</h2>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="overload">Overload Time</TabsTrigger>
            <TabsTrigger value="underusage">Underusage Time</TabsTrigger>
            <TabsTrigger value="missing">Missing Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Efficient Usage</p>
                <p className="text-2xl font-bold text-primary">15.6 hours</p>
                <p className="text-xs text-muted-foreground mt-1">65% of operating time</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Avg. Load</p>
                <p className="text-2xl font-bold text-secondary">81.4%</p>
                <p className="text-xs text-muted-foreground mt-1">Within optimal range</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overload" className="mt-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500 font-medium">Overload Time</p>
              <p className="text-2xl font-bold text-yellow-500 mt-2">4.8 hours</p>
              <p className="text-xs text-yellow-600 mt-1">20% of operating time - System activated load reduction 23 times</p>
            </div>
          </TabsContent>

          <TabsContent value="underusage" className="mt-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-500 font-medium">Underusage Time</p>
              <p className="text-2xl font-bold text-blue-500 mt-2">2.4 hours</p>
              <p className="text-xs text-blue-600 mt-1">10% of operating time - Feed rate optimization recommended</p>
            </div>
          </TabsContent>

          <TabsContent value="missing" className="mt-4">
            <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <p className="text-sm text-gray-500 font-medium">Missing Data</p>
              <p className="text-2xl font-bold text-gray-500 mt-2">1.2 hours</p>
              <p className="text-xs text-gray-600 mt-1">5% of operating time - Check sensor connectivity</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
