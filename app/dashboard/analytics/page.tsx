'use client'

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { Calendar, Download } from 'lucide-react'

const dailyData = [
  { date: 'Day 1', efficiency: 85, overload: 12, underutilized: 3, dataQuality: 95 },
  { date: 'Day 2', efficiency: 88, overload: 8, underutilized: 4, dataQuality: 96 },
  { date: 'Day 3', efficiency: 82, overload: 15, underutilized: 3, dataQuality: 92 },
  { date: 'Day 4', efficiency: 90, overload: 5, underutilized: 5, dataQuality: 98 },
  { date: 'Day 5', efficiency: 87, overload: 10, underutilized: 3, dataQuality: 94 },
  { date: 'Day 6', efficiency: 91, overload: 4, underutilized: 5, dataQuality: 97 },
  { date: 'Day 7', efficiency: 89, overload: 7, underutilized: 4, dataQuality: 96 },
]

const powerTrendData = [
  { hour: '00', power: 1800, solar: 0 },
  { hour: '04', power: 1600, solar: 0 },
  { hour: '08', power: 2100, solar: 200 },
  { hour: '12', power: 2400, solar: 450 },
  { hour: '16', power: 2300, solar: 350 },
  { hour: '20', power: 1900, solar: 50 },
  { hour: '23', power: 1700, solar: 0 },
]

const waterEfficiencyData = [
  { machine: 'Line 1', usage: 4200, efficiency: 92 },
  { machine: 'Line 2', usage: 3800, efficiency: 95 },
  { machine: 'Line 3', usage: 4500, efficiency: 88 },
  { machine: 'Line 4', usage: 3600, efficiency: 97 },
  { machine: 'Line 5', usage: 4100, efficiency: 91 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">Comprehensive analysis of factory operations</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Time Range Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last 7 days</span>
          <div className="flex gap-2">
            {['Today', 'Week', 'Month', 'Quarter', 'Year'].map((range) => (
              <Button
                key={range}
                size="sm"
                variant={range === 'Week' ? 'default' : 'outline'}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Analytics */}
      <div className="space-y-6">
        {/* Efficiency Metrics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Daily Efficiency Metrics</h2>
          <Tabs defaultValue="efficiency" className="w-full">
            <TabsList>
              <TabsTrigger value="efficiency">Efficiency %</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="quality">Data Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="efficiency" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#90EE90" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#90EE90" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                  <XAxis dataKey="date" stroke="rgb(148 163 184)" />
                  <YAxis stroke="rgb(148 163 184)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#90EE90"
                    fillOpacity={1}
                    fill="url(#colorEfficiency)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="anomalies" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                  <XAxis dataKey="date" stroke="rgb(148 163 184)" />
                  <YAxis stroke="rgb(148 163 184)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                  <Legend />
                  <Bar dataKey="overload" fill="#FB923C" name="Overload Events" />
                  <Bar dataKey="underutilized" fill="#60A5FA" name="Underutilized" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="quality" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                  <XAxis dataKey="date" stroke="rgb(148 163 184)" />
                  <YAxis stroke="rgb(148 163 184)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                  <Line
                    type="monotone"
                    dataKey="dataQuality"
                    stroke="#2E8B57"
                    strokeWidth={2}
                    dot={{ fill: '#2E8B57', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Power & Solar */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Power Consumption vs Solar Output</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={powerTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
              <XAxis dataKey="hour" stroke="rgb(148 163 184)" />
              <YAxis stroke="rgb(148 163 184)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
              <Legend />
              <Bar dataKey="power" fill="#ADD8E6" name="Power Consumption (kW)" />
              <Line type="monotone" dataKey="solar" stroke="#FCD34D" strokeWidth={2} name="Solar Output (kW)" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Water Efficiency by Machine */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Water Efficiency by Production Line</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={waterEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
              <XAxis dataKey="machine" stroke="rgb(148 163 184)" />
              <YAxis yAxisId="left" stroke="rgb(148 163 184)" />
              <YAxis yAxisId="right" orientation="right" stroke="rgb(148 163 184)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="usage" fill="#2E8B57" name="Water Usage (L)" />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#90EE90" strokeWidth={2} name="Efficiency %" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-primary">
            <h3 className="font-semibold text-foreground mb-2">Best Performing Line</h3>
            <p className="text-2xl font-bold text-primary mb-1">Line 4</p>
            <p className="text-xs text-muted-foreground">97% efficiency with optimal water usage</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-yellow-500">
            <h3 className="font-semibold text-foreground mb-2">Avg. Efficiency</h3>
            <p className="text-2xl font-bold text-yellow-500 mb-1">87.4%</p>
            <p className="text-xs text-muted-foreground">↑ 2.1% from last period</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="font-semibold text-foreground mb-2">Total Water Saved</h3>
            <p className="text-2xl font-bold text-blue-500 mb-1">1,240 L</p>
            <p className="text-xs text-muted-foreground">vs. previous week</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
