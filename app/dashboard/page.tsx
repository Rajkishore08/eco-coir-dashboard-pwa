'use client'

import { Zap, Droplets, Gauge, Leaf, Activity, Cloud } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { GaugeWidget } from '@/components/gauge-widget'
import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const powerConsumptionData = [
  { time: '00:00', consumption: 2400 },
  { time: '04:00', consumption: 2210 },
  { time: '08:00', consumption: 2290 },
  { time: '12:00', consumption: 2000 },
  { time: '16:00', consumption: 2181 },
  { time: '20:00', consumption: 2500 },
  { time: '23:59', consumption: 2100 },
]

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
  { name: 'Efficient', value: 65, fill: '#90EE90' },
  { name: 'Overload', value: 20, fill: '#FB923C' },
  { name: 'Underutilized', value: 10, fill: '#60A5FA' },
  { name: 'Missing Data', value: 5, fill: '#94A3B8' },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Factory Overview</h1>
        <p className="text-muted-foreground">Real-time monitoring of coir processing operations</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Power Consumption"
          value={15240}
          unit="kWh"
          icon={Zap}
          trend={{ value: 12, isPositive: true }}
          status="normal"
        />
        <KPICard
          title="System Efficiency Score"
          value={87.5}
          unit="%"
          icon={Activity}
          trend={{ value: 5, isPositive: true }}
          status="normal"
        />
        <KPICard
          title="Water Usage Today"
          value={28500}
          unit="L"
          icon={Droplets}
          trend={{ value: 8, isPositive: false }}
          status="normal"
        />
        <KPICard
          title="Average Machine Load"
          value={81.4}
          unit="%"
          icon={Gauge}
          trend={{ value: 3, isPositive: true }}
          status="normal"
        />
        <KPICard
          title="Solar Energy Output"
          value={8.2}
          unit="kWh"
          icon={Cloud}
          trend={{ value: 15, isPositive: true }}
          status="normal"
        />
        <KPICard
          title="Operational Status"
          value="Active"
          icon={Leaf}
          status="normal"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Consumption Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Power Consumption</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
              <XAxis dataKey="time" stroke="rgb(148 163 184)" />
              <YAxis stroke="rgb(148 163 184)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="#90EE90"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Machine Load Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Machine Load Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={machineLoadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
              <XAxis dataKey="time" stroke="rgb(148 163 184)" />
              <YAxis stroke="rgb(148 163 184)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
              <Bar dataKey="load" fill="#ADD8E6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Water Usage Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Water Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
              <XAxis dataKey="time" stroke="rgb(148 163 184)" />
              <YAxis stroke="rgb(148 163 184)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
              <Bar dataKey="usage" fill="#2E8B57" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Efficiency Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Efficiency Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
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
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Real-time Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GaugeWidget title="Machine Load" value={81.4} color="#ADD8E6" />
          <GaugeWidget title="Power Usage" value={76} color="#90EE90" />
          <GaugeWidget title="Water Flow" value={64} color="#2E8B57" />
          <GaugeWidget title="System Temp" value={45} maxValue={100} color="#FB923C" />
        </div>
      </div>

      {/* Detailed Metrics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Analytics</h2>
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
