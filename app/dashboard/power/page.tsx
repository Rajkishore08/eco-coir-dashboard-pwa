'use client'

import { Zap, Cloud, Gauge, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { KPICard } from '@/components/kpi-card'
import { GaugeWidget } from '@/components/gauge-widget'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const hourlyData = [
  { time: '00:00', consumption: 1800, solar: 0 },
  { time: '04:00', consumption: 1600, solar: 0 },
  { time: '08:00', consumption: 2100, solar: 200 },
  { time: '12:00', consumption: 2400, solar: 450 },
  { time: '16:00', consumption: 2300, solar: 350 },
  { time: '20:00', consumption: 1900, solar: 50 },
  { time: '23:59', consumption: 1700, solar: 0 },
]

const machineConsumptionData = [
  { machine: 'Line 1', consumption: 2200, status: 'normal' },
  { machine: 'Line 2', consumption: 2400, status: 'warning' },
  { machine: 'Line 3', consumption: 2100, status: 'normal' },
  { machine: 'Line 4', consumption: 1900, status: 'normal' },
  { machine: 'Line 5', consumption: 2300, status: 'normal' },
]

const peakHourData = [
  { hour: '00-04', gridPower: 1600, solarPower: 0, batteryUsage: 0 },
  { hour: '04-08', gridPower: 1800, solarPower: 50, batteryUsage: 0 },
  { hour: '08-12', gridPower: 1900, solarPower: 300, batteryUsage: 0 },
  { hour: '12-16', gridPower: 1800, solarPower: 400, batteryUsage: 0 },
  { hour: '16-20', gridPower: 2100, solarPower: 200, batteryUsage: 0 },
  { hour: '20-00', gridPower: 1750, solarPower: 0, batteryUsage: 50 },
]

export default function PowerManagementPage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Power Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor energy consumption and solar generation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <KPICard
          title="Current Consumption"
          value={2450}
          unit="kW"
          icon={Zap}
          trend={{ value: 8, isPositive: false }}
          status="normal"
        />
        <KPICard
          title="Solar Generation"
          value={345}
          unit="kW"
          icon={Cloud}
          trend={{ value: 12, isPositive: true }}
          status="normal"
        />
        <KPICard
          title="Grid Dependency"
          value={67.2}
          unit="%"
          icon={Gauge}
          trend={{ value: 5, isPositive: false }}
          status="normal"
        />
      </div>

      {/* Real-time Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GaugeWidget
          title="Current Power Usage"
          value={67}
          maxValue={100}
          color="#FB923C"
        />
        <GaugeWidget
          title="Solar Efficiency"
          value={78}
          maxValue={100}
          color="#FCD34D"
        />
      </div>

      {/* Main Charts */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Power Analysis</h2>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList>
            <TabsTrigger value="hourly">Hourly Consumption</TabsTrigger>
            <TabsTrigger value="machines">By Machine</TabsTrigger>
            <TabsTrigger value="sources">Power Sources</TabsTrigger>
          </TabsList>

          {/* Hourly */}
          <TabsContent value="hourly" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADD8E6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ADD8E6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FCD34D" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                <XAxis dataKey="time" stroke="rgb(148 163 184)" />
                <YAxis stroke="rgb(148 163 184)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#ADD8E6"
                  fillOpacity={1}
                  fill="url(#colorConsumption)"
                  name="Power Consumption (kW)"
                />
                <Area
                  type="monotone"
                  dataKey="solar"
                  stroke="#FCD34D"
                  fillOpacity={1}
                  fill="url(#colorSolar)"
                  name="Solar Output (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* By Machine */}
          <TabsContent value="machines" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={machineConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                <XAxis dataKey="machine" stroke="rgb(148 163 184)" />
                <YAxis stroke="rgb(148 163 184)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                <Bar dataKey="consumption" fill="#2E8B57" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Power Sources */}
          <TabsContent value="sources" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={peakHourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85)" />
                <XAxis dataKey="hour" stroke="rgb(148 163 184)" />
                <YAxis stroke="rgb(148 163 184)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: '1px solid rgb(51 65 85)' }} />
                <Legend />
                <Bar dataKey="gridPower" fill="#90EE90" name="Grid Power (kW)" />
                <Bar dataKey="solarPower" fill="#FCD34D" name="Solar Power (kW)" />
                <Bar dataKey="batteryUsage" fill="#2E8B57" name="Battery Usage (kW)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Energy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Daily Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Total Consumption</span>
              <span className="font-semibold text-foreground">45,200 kWh</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Solar Generated</span>
              <span className="font-semibold text-yellow-500">8,450 kWh</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Grid Supplied</span>
              <span className="font-semibold text-primary">36,750 kWh</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-muted-foreground">Savings (Solar)</span>
              <span className="font-semibold text-primary">₹2,535</span>
            </div>
          </div>
        </Card>

        {/* Peak Hours */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Peak Hours & Recommendations</h2>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-600">Peak Consumption: 12:00-16:00</p>
              <p className="text-xs text-yellow-600 mt-1">Consider shifting non-critical loads</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">Solar Peak: 12:00-14:00</p>
              <p className="text-xs text-primary mt-1">Maximum solar generation window</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium text-blue-500">Off-Peak: 00:00-06:00</p>
              <p className="text-xs text-blue-600 mt-1">Lowest power consumption period</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-600">Efficiency Target: 95%</p>
              <p className="text-xs text-green-600 mt-1">Currently at 92% - ↑ 3% improvement possible</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Power Cost Analysis */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Cost Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Daily Cost</p>
            <p className="text-2xl font-bold text-foreground">₹2,205</p>
            <p className="text-xs text-muted-foreground mt-2">Grid electricity</p>
          </div>
          <div className="text-center p-4 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Monthly Cost</p>
            <p className="text-2xl font-bold text-foreground">₹66,150</p>
            <p className="text-xs text-muted-foreground mt-2">Projected (30 days)</p>
          </div>
          <div className="text-center p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Solar Savings</p>
            <p className="text-2xl font-bold text-primary">₹2,535</p>
            <p className="text-xs text-primary mt-2">Daily average</p>
          </div>
          <div className="text-center p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">ROI Period</p>
            <p className="text-2xl font-bold text-green-600">6.8 years</p>
            <p className="text-xs text-green-600 mt-2">Solar system investment</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
