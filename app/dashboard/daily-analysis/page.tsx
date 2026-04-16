'use client'

import { Card } from '@/components/ui/card'
import { Calendar, Clock, Zap, AlertTriangle, TrendingDown, Activity, CalendarDays } from 'lucide-react'
import { useRealtimeEvents, useLiveData } from '@/lib/hooks/useFirebaseData'
import { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface DayAnalysis {
  date: string;
  totalCurrent: number;
  avgCurrent: number;
  maxCurrent: number;
  minCurrent: number;
  efficientTime: number;
  overloadTime: number;
  underusageTime: number;
  idleTime: number;
  missingTime: number;
  efficientPercentage: number;
  totalEvents: number;
  dataPoints: number;
}

const STATUS_COLORS = {
  EFFICIENT: '#22C55E',
  OVERLOAD: '#EF4444',
  UNDERUSAGE: '#F59E0B',
  IDLE: '#9CA3AF',
  MISSING: '#6B7280',
}

export default function DailyAnalysisPage() {
  const { events, totalCount } = useRealtimeEvents("device_01", 5000)
  const { data: liveData } = useLiveData()
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Calculate day-wise analysis
  const dailyAnalysis = useMemo((): DayAnalysis[] => {
    if (!events || events.length === 0) return []
    
    const dayMap = new Map<string, {
      currentSum: number
      currentMax: number
      currentMin: number
      efficientTime: number
      overloadTime: number
      underusageTime: number
      idleTime: number
      missingTime: number
      totalEvents: number
      dataPoints: number
    }>()
    
    events.forEach((event) => {
      const date = new Date(event.event_time * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      
      if (!dayMap.has(date)) {
        dayMap.set(date, {
          currentSum: 0,
          currentMax: 0,
          currentMin: Infinity,
          efficientTime: 0,
          overloadTime: 0,
          underusageTime: 0,
          idleTime: 0,
          missingTime: 0,
          totalEvents: 0,
          dataPoints: 0
        })
      }
      
      const data = dayMap.get(date)!
      data.currentSum += event.current_value
      data.currentMax = Math.max(data.currentMax, event.current_value)
      data.currentMin = Math.min(data.currentMin, event.current_value)
      data.totalEvents += 1
      data.dataPoints += 1
      
      // Add duration to respective status
      switch (event.status_type) {
        case 'EFFICIENT':
          data.efficientTime += event.duration
          break
        case 'OVERLOAD':
          data.overloadTime += event.duration
          break
        case 'UNDERUSAGE':
          data.underusageTime += event.duration
          break
        case 'IDLE':
          data.idleTime += event.duration
          break
        case 'MISSING':
          data.missingTime += event.duration
          break
      }
    })
    
    return Array.from(dayMap.entries())
      .map(([date, data]) => {
        const totalTime = data.efficientTime + data.overloadTime + data.underusageTime + data.idleTime + data.missingTime
        return {
          date,
          totalCurrent: parseFloat(data.currentSum.toFixed(2)),
          avgCurrent: parseFloat((data.currentSum / data.dataPoints).toFixed(2)),
          maxCurrent: data.currentMax,
          minCurrent: data.currentMin === Infinity ? 0 : data.currentMin,
          efficientTime: data.efficientTime,
          overloadTime: data.overloadTime,
          underusageTime: data.underusageTime,
          idleTime: data.idleTime,
          missingTime: data.missingTime,
          efficientPercentage: totalTime > 0 ? parseFloat(((data.efficientTime / totalTime) * 100).toFixed(1)) : 0,
          totalEvents: data.totalEvents,
          dataPoints: data.dataPoints,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  // Get available dates for date picker
  const availableDates = useMemo(() => {
    return dailyAnalysis.map(day => day.date).reverse() // Most recent first
  }, [dailyAnalysis])

  // Calculate data for selected specific date
  const selectedDayData = useMemo(() => {
    if (!selectedDate || !events) return null
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.event_time * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      return eventDate === selectedDate
    })
    
    if (dayEvents.length === 0) return null
    
    // Calculate hourly breakdown
    const hourlyData = new Map<number, { current: number, count: number }>()
    const missingHours = new Set<number>() // Track hours with MISSING data
    const statusBreakdown = { EFFICIENT: 0, OVERLOAD: 0, UNDERUSAGE: 0, IDLE: 0, MISSING: 0 }
    let totalCurrent = 0
    let maxCurrent = 0
    
    // First pass: identify hours with MISSING events
    dayEvents.forEach(event => {
      if (event.status_type === 'MISSING') {
        const startTime = event.event_time * 1000
        const endTime = startTime + (event.duration * 1000)
        
        const startHour = new Date(startTime).getHours()
        const endHour = new Date(endTime).getHours()
        
        // Mark all hours from start to end (inclusive)
        if (startHour <= endHour) {
          for (let h = startHour; h <= endHour; h++) {
            missingHours.add(h)
          }
        } else {
          // Handle case where it spans midnight
          for (let h = startHour; h < 24; h++) {
            missingHours.add(h)
          }
          for (let h = 0; h <= endHour; h++) {
            missingHours.add(h)
          }
        }
      }
    })
    
    // Second pass: calculate hourly data, excluding hours with MISSING
    dayEvents.forEach(event => {
      // Only include non-MISSING events in hourly current pattern and averages
      if (event.status_type !== 'MISSING') {
        const hour = new Date(event.event_time * 1000).getHours()
        
        // Skip this hour if it has any MISSING data
        if (!missingHours.has(hour)) {
          if (!hourlyData.has(hour)) {
            hourlyData.set(hour, { current: 0, count: 0 })
          }
          const data = hourlyData.get(hour)!
          data.current += event.current_value
          data.count += 1
        }
        
        totalCurrent += event.current_value
        maxCurrent = Math.max(maxCurrent, event.current_value)
      }
      
      // Include all events in status breakdown (including MISSING)
      if (event.status_type in statusBreakdown) {
        statusBreakdown[event.status_type as keyof typeof statusBreakdown] += event.duration
      }
    })
    
    // Create hourly array from 6 AM to 11 PM (6-23 hours) with nulls for missing/no data
    const hourlyChartData = Array.from({ length: 18 }, (_, index) => {
      const hour = index + 6 // Start from 6 AM
      const data = hourlyData.get(hour)
      return {
        hour: `${hour}:00`,
        avgCurrent: data ? parseFloat((data.current / data.count).toFixed(2)) : null
      }
    })
    
    const totalTime = Object.values(statusBreakdown).reduce((sum, time) => sum + time, 0)
    const statusChartData = Object.entries(statusBreakdown)
      .filter(([_, time]) => time > 0)
      .map(([status, time]) => ({
        name: status,
        value: parseFloat((time / 3600).toFixed(2)), // Convert to hours
        percentage: parseFloat(((time / totalTime) * 100).toFixed(1))
      }))
    
    // Count non-MISSING events for average calculation
    const nonMissingEvents = dayEvents.filter(e => e.status_type !== 'MISSING')
    
    return {
      events: dayEvents,
      hourlyData: hourlyChartData,
      statusData: statusChartData,
      avgCurrent: nonMissingEvents.length > 0 ? parseFloat((totalCurrent / nonMissingEvents.length).toFixed(2)) : 0,
      maxCurrent: maxCurrent,
      totalEvents: dayEvents.length,
      statusBreakdown
    }
  }, [selectedDate, events])

  // Convert seconds to hours:minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Daily Analysis</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Day-wise breakdown of motor operations and efficiency</p>
      </div>

      {/* View Mode Tabs & Date Picker */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Days Overview
            </button>
            <button
              onClick={() => {
                setViewMode('single')
                if (!selectedDate && availableDates.length > 0) {
                  setSelectedDate(availableDates[0])
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'single'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single Day View
            </button>
          </div>

          {/* Date Picker (only show in single day view) */}
          {viewMode === 'single' && (
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-green-600" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Date</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* All Days View */}
      {viewMode === 'all' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Days</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{dailyAnalysis.length}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalCount?.toLocaleString() || 0}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Avg Daily Current</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {dailyAnalysis.length > 0 
              ? (dailyAnalysis.reduce((sum, day) => sum + day.avgCurrent, 0) / dailyAnalysis.length).toFixed(1)
              : 0} A
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Avg Efficiency</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {dailyAnalysis.length > 0 
              ? (dailyAnalysis.reduce((sum, day) => sum + day.efficientPercentage, 0) / dailyAnalysis.length).toFixed(1)
              : 0} %
          </p>
        </Card>
      </div>

      {/* Daily Current Usage Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Average Current</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgCurrent" name="Avg Current (A)" fill="#22C55E" />
            <Bar dataKey="maxCurrent" name="Max Current (A)" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily Efficiency Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Efficiency Percentage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="efficientPercentage" stroke="#22C55E" strokeWidth={3} name="Efficiency %" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Time Breakdown by Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Time Breakdown by Status</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dailyAnalysis.map(day => ({
            date: day.date,
            efficient: parseFloat((day.efficientTime / 3600).toFixed(1)),
            overload: parseFloat((day.overloadTime / 3600).toFixed(1)),
            underusage: parseFloat((day.underusageTime / 3600).toFixed(1)),
            idle: parseFloat((day.idleTime / 3600).toFixed(1)),
            missing: parseFloat((day.missingTime / 3600).toFixed(1)),
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="efficient" stackId="a" fill="#22C55E" name="Efficient (hrs)" />
            <Bar dataKey="overload" stackId="a" fill="#EF4444" name="Overload (hrs)" />
            <Bar dataKey="underusage" stackId="a" fill="#F59E0B" name="Underusage (hrs)" />
            <Bar dataKey="idle" stackId="a" fill="#9CA3AF" name="Idle (hrs)" />
            <Bar dataKey="missing" stackId="a" fill="#6B7280" name="Missing (hrs)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Day-wise Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Daily Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Date</th>
                <th className="p-3 text-right font-semibold">Avg Current</th>
                <th className="p-3 text-right font-semibold">Max Current</th>
                <th className="p-3 text-right font-semibold">Efficient Time</th>
                <th className="p-3 text-right font-semibold">Overload Time</th>
                <th className="p-3 text-right font-semibold">Underusage Time</th>
                <th className="p-3 text-right font-semibold">Idle Time</th>
                <th className="p-3 text-right font-semibold">Missing Time</th>
                <th className="p-3 text-right font-semibold">Efficiency %</th>
                <th className="p-3 text-right font-semibold">Events</th>
              </tr>
            </thead>
            <tbody>
              {dailyAnalysis.map((day, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{day.date}</td>
                  <td className="p-3 text-right">{day.avgCurrent} A</td>
                  <td className="p-3 text-right text-red-600 font-semibold">{day.maxCurrent} A</td>
                  <td className="p-3 text-right text-green-600">{formatDuration(day.efficientTime)}</td>
                  <td className="p-3 text-right text-red-600">{formatDuration(day.overloadTime)}</td>
                  <td className="p-3 text-right text-amber-600">{formatDuration(day.underusageTime)}</td>
                  <td className="p-3 text-right text-gray-500">{formatDuration(day.idleTime)}</td>
                  <td className="p-3 text-right text-gray-600 font-semibold">{formatDuration(day.missingTime)}</td>
                  <td className="p-3 text-right font-bold">
                    <span className={day.efficientPercentage >= 70 ? "text-green-600" : day.efficientPercentage >= 50 ? "text-amber-600" : "text-red-600"}>
                      {day.efficientPercentage}%
                    </span>
                  </td>
                  <td className="p-3 text-right text-muted-foreground">{day.totalEvents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyAnalysis.slice(-7).reverse().map((day, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{day.date}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                day.efficientPercentage >= 70 ? "bg-green-100 text-green-700" :
                day.efficientPercentage >= 50 ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {day.efficientPercentage}% Efficient
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Avg Current
                </span>
                <span className="font-semibold text-foreground">{day.avgCurrent} A</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  Efficient Time
                </span>
                <span className="font-semibold text-green-600">{formatDuration(day.efficientTime)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Overload Time
                </span>
                <span className="font-semibold text-red-600">{formatDuration(day.overloadTime)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                  Underusage Time
                </span>
                <span className="font-semibold text-amber-600">{formatDuration(day.underusageTime)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Idle Time
                </span>
                <span className="font-semibold text-gray-500">{formatDuration(day.idleTime)}</span>
              </div>
              
              {day.missingTime > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    Missing Time
                  </span>
                  <span className="font-semibold text-gray-600">{formatDuration(day.missingTime)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Total Events</span>
                  <span className="text-sm font-semibold text-muted-foreground">{day.totalEvents}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
        </>
      )}

      {/* Single Day View */}
      {viewMode === 'single' && (
        <>
          {!selectedDate && (
            <Card className="p-8 text-center">
              <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Please select a date to view detailed analysis</p>
            </Card>
          )}

          {selectedDate && !selectedDayData && (
            <Card className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-semibold">No data available for {selectedDate}</p>
              <p className="text-gray-500 mt-2">Try selecting a different date</p>
            </Card>
          )}

          {selectedDate && selectedDayData && (
            <>
              {/* Single Day Header */}
              <div className="bg-gradient-to-r from-green-50 to-cyan-50 p-6 rounded-lg border border-green-200">
                <h2 className="text-2xl font-bold text-green-800 mb-2">{selectedDate}</h2>
                <p className="text-green-700">Detailed analysis for this specific day</p>
              </div>

              {/* Single Day Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{selectedDayData.totalEvents}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">Avg Current</h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{selectedDayData.avgCurrent} A</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">Max Current</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{selectedDayData.maxCurrent} A</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">Efficient Time</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{formatDuration(selectedDayData.statusBreakdown.EFFICIENT)}</p>
                </Card>
              </div>

              {/* Hourly Current Pattern */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Hourly Current Pattern (6 AM - 11 PM - Scroll to View)</h2>
                <div className="overflow-x-scroll overflow-y-hidden border border-gray-200 rounded-lg" style={{ maxHeight: '450px' }}>
                  <div style={{ width: '2400px', height: '400px' }}>
                    <LineChart 
                      data={selectedDayData.hourlyData} 
                      width={2400} 
                      height={400}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="hour" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        interval={0}
                        tick={{ fontSize: 14, fill: '#374151' }}
                      />
                      <YAxis 
                        label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                        tick={{ fontSize: 14 }}
                      />
                      <Tooltip 
                        formatter={(value: any) => value !== null ? [value + ' A', 'Avg Current'] : ['No Data', '']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', border: '2px solid #22C55E', borderRadius: '8px' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="avgCurrent" 
                        stroke="#22C55E" 
                        strokeWidth={4} 
                        name="Avg Current (A)"
                        connectNulls={false}
                        dot={{ r: 6, fill: '#22C55E', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#16A34A' }}
                      />
                    </LineChart>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center flex items-center justify-center gap-2">
                  <span className="text-gray-400">←</span>
                  <span>Scroll horizontally to view all hours (6 AM - 11 PM)</span>
                  <span className="text-gray-400">→</span>
                </p>
              </Card>

              {/* Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={selectedDayData.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {selectedDayData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Status Breakdown Table */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Time Breakdown</h2>
                  <div className="space-y-4">
                    {Object.entries(selectedDayData.statusBreakdown).map(([status, seconds]) => {
                      const totalSeconds = Object.values(selectedDayData.statusBreakdown).reduce((sum, s) => sum + s, 0)
                      const percentage = totalSeconds > 0 ? ((seconds / totalSeconds) * 100).toFixed(1) : 0
                      
                      return (
                        <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
                            />
                            <span className="font-medium text-foreground">{status}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">{formatDuration(seconds)}</p>
                            <p className="text-sm text-muted-foreground">{percentage}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Recent Events Table */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent Events ({selectedDayData.events.length} total)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-semibold">Time</th>
                        <th className="p-3 text-right font-semibold">Current</th>
                        <th className="p-3 text-center font-semibold">Status</th>
                        <th className="p-3 text-right font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDayData.events.slice(0, 20).map((event, index) => (
                        <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            {new Date(event.event_time * 1000).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="p-3 text-right font-semibold">{event.current_value} A</td>
                          <td className="p-3 text-center">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: STATUS_COLORS[event.status_type as keyof typeof STATUS_COLORS] }}
                            >
                              {event.status_type}
                            </span>
                          </td>
                          <td className="p-3 text-right text-muted-foreground">{event.duration}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedDayData.events.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Showing first 20 events. Total: {selectedDayData.events.length} events
                  </p>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
