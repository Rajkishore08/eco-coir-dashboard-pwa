'use client'

import { Droplets, Gauge, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { KPICard } from '@/components/kpi-card'
import { GaugeWidget } from '@/components/gauge-widget'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const dailyWaterData = [
  { date: 'Mon', usage: 28500, target: 30000 },
  { date: 'Tue', usage: 29200, target: 30000 },
  { date: 'Wed', usage: 27800, target: 30000 },
  { date: 'Thu', usage: 28900, target: 30000 },
  { date: 'Fri', usage: 30100, target: 30000 },
  { date: 'Sat', usage: 26700, target: 30000 },
  { date: 'Sun', usage: 28300, target: 30000 },
]

const machineWaterData = [
  { machine: 'Line 1', usage: 4200, efficiency: 92, status: 'optimal' },
  { machine: 'Line 2', usage: 3800, efficiency: 95, status: 'optimal' },
  { machine: 'Line 3', usage: 4500, efficiency: 88, status: 'warning' },
  { machine: 'Line 4', usage: 3600, efficiency: 97, status: 'optimal' },
  { machine: 'Line 5', usage: 4100, efficiency: 91, status: 'normal' },
]

const hourlyFlowData = [
  { time: '00:00', flow: 450 },
  { time: '04:00', flow: 380 },
  { time: '08:00', flow: 580 },
  { time: '12:00', flow: 620 },
  { time: '16:00', flow: 610 },
  { time: '20:00', flow: 540 },
  { time: '23:59', flow: 420 },
]

export default function WaterUsagePage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Water Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor water consumption and optimize efficiency</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <KPICard
          title="Today's Water Usage"
          value={28500}
          unit="L"
          icon={Droplets}
          trend={{ value: 5, isPositive: false }}
          status="normal"
        />
        <KPICard
          title="Weekly Average"
          value={28630}
          unit="L/day"
          icon={Gauge}
          trend={{ value: 2, isPositive: true }}
          status="normal"
        />
        <KPICard
          title="Water Efficiency"
          value={92.1}
          unit="%"
          icon={TrendingDown}
          trend={{ value: 3, isPositive: true }}
          status="normal"
        />
      </div>

      {/* Real-time Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GaugeWidget
          title="Current Flow Rate"
          value={580}
          maxValue={800}
          unit="L/min"
          color="#ADD8E6"
        />
        <GaugeWidget
          title="System Efficiency"
          value={92}
          maxValue={100}
          unit="%"
          color="#2E8B57"
        />
      </div>

      {/* Main Analysis */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Water Usage Analysis</h2>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList>
            <TabsTrigger value="daily">Daily Trend</TabsTrigger>
            <TabsTrigger value="machines">By Machine</TabsTrigger>
            <TabsTrigger value="flow">Flow Rate</TabsTrigger>
          </TabsList>

          {/* Daily Trend */}
          <TabsContent value="daily" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dailyWaterData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADD8E6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ADD8E6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                <XAxis dataKey="date" stroke="rgb(148 163 184)" />
                <YAxis stroke="rgb(148 163 184)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#ADD8E6"
                  fillOpacity={1}
                  fill="url(#colorUsage)"
                  name="Actual Usage (L)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#FB923C"
                  strokeDasharray="5 5"
                  name="Target (L)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* By Machine */}
          <TabsContent value="machines" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={machineWaterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                <XAxis dataKey="machine" stroke="rgb(148 163 184)" />
                <YAxis stroke="rgb(148 163 184)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                <Bar dataKey="usage" fill="#2E8B57" name="Water Usage (L)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Flow Rate */}
          <TabsContent value="flow" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={hourlyFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                <XAxis dataKey="time" stroke="rgb(148 163 184)" />
                <YAxis stroke="rgb(148 163 184)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#ADD8E6"
                  strokeWidth={2}
                  dot={{ fill: '#ADD8E6', r: 4 }}
                  name="Flow Rate (L/min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Machine Performance Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Production Line Performance</h2>
        <div className="space-y-3">
          {machineWaterData.map((machine) => (
            <div
              key={machine.machine}
              className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{machine.machine}</h3>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    machine.status === 'optimal'
                      ? 'bg-primary/20 text-primary'
                      : machine.status === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : 'bg-blue-500/20 text-blue-600'
                  }`}
                >
                  {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-muted-foreground">Usage Today</p>
                    <p className="font-semibold text-foreground">{machine.usage} L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Efficiency</p>
                    <p className="font-semibold text-foreground">{machine.efficiency}%</p>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="w-32">
                  <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${machine.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Water Conservation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Water Saved (vs Target)</p>
          <p className="text-2xl font-bold text-primary">1,370 L</p>
          <p className="text-xs text-primary mt-1">4.4% below weekly target</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Avg Daily Usage</p>
          <p className="text-2xl font-bold text-foreground">28,630 L</p>
          <p className="text-xs text-muted-foreground mt-1">Week average</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Recycled Water</p>
          <p className="text-2xl font-bold text-secondary">35%</p>
          <p className="text-xs text-secondary mt-1">System utilization rate</p>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Optimization Recommendations</h2>
        <div className="space-y-3">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-600 mb-1">Line 3 Efficiency Alert</p>
            <p className="text-xs text-yellow-600">Water efficiency at 88%. Consider cleaning or maintenance of filtration system.</p>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-primary mb-1">Optimization Opportunity</p>
            <p className="text-xs text-primary">Lines 2 and 4 are performing exceptionally. Share best practices with other lines.</p>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-600 mb-1">Water Recycling Potential</p>
            <p className="text-xs text-green-600">Current recycling at 35%. Upgrading to advanced RO system could increase to 55%.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
