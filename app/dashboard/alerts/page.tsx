'use client'

import { useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, XCircle, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAlertsDB, Alert } from '@/lib/hooks/useAlertsDB'

function AlertIcon({ severity }: { severity: string }) {
  const icons = {
    critical: <AlertTriangle className="h-6 w-6 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />,
    warning: <AlertCircle className="h-6 w-6 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />,
    info: <CheckCircle className="h-6 w-6 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />,
  }
  return icons[severity as keyof typeof icons] || icons.warning
}

function SeverityBadge({ severity }: { severity: string }) {
  const badges = {
    critical: <Badge className="bg-red-100 text-red-700 capitalize text-xs">Critical</Badge>,
    warning: <Badge className="bg-amber-100 text-amber-700 capitalize text-xs">Warning</Badge>,
    info: <Badge className="bg-green-100 text-green-700 capitalize text-xs">Info</Badge>,
  }
  return badges[severity as keyof typeof badges]
}

function getRelativeTime(timestamp: number | string) {
  const ts = Number(timestamp)
  if (isNaN(ts)) return String(timestamp)
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

export default function AlertsPage() {
  const { alerts, isLoading, addAlert, resolveAlert } = useAlertsDB()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSeverity, setNewSeverity] = useState<'critical' | 'warning' | 'info'>('warning')
  const [newType, setNewType] = useState<'overload' | 'underusage' | 'sensor' | 'maintenance' | 'system'>('system')
  
  const activeAlerts = alerts.filter(a => a.status === 'active')
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved')
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active')

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newDesc) return

    await addAlert({
      title: newTitle,
      description: newDesc,
      severity: newSeverity,
      type: newType,
      actionRequired: newSeverity === 'critical' || newSeverity === 'warning'
    })

    setNewTitle('')
    setNewDesc('')
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">System Alerts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor and manage all system alerts and notifications natively stored in Firebase</p>
        </div>
        
        {/* Create Alert Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-5 h-5" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white border border-gray-100 shadow-xl">
            <DialogHeader>
              <DialogTitle>Broadcast New Alert</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAlert} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Alert Title</Label>
                <Input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Line 3 Motor Overheating" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Briefly describe the notification anomaly." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={newSeverity} onValueChange={(v: any) => setNewSeverity(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overload">Overload</SelectItem>
                      <SelectItem value="underusage">Underusage</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700">Dispatch Alert</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Alert Summary Cards - Colorful */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-1 uppercase">Active Alerts</p>
                  <p className="text-4xl font-bold text-amber-600">{activeAlerts.length}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-amber-400 opacity-30" />
              </div>
            </Card>

            <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-400 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-red-700 mb-1 uppercase">Critical Issues</p>
                  <p className="text-3xl sm:text-4xl font-bold text-red-600">{criticalAlerts.length}</p>
                </div>
                <XCircle className="h-8 sm:h-10 w-8 sm:w-10 text-red-400 opacity-30 flex-shrink-0" />
              </div>
            </Card>

            <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-400 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-700 mb-1 uppercase">Resolved</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600">{resolvedAlerts.length}</p>
                </div>
                <CheckCircle className="h-8 sm:h-10 w-8 sm:w-10 text-green-400 opacity-30 flex-shrink-0" />
              </div>
            </Card>
          </div>

          {/* Alerts Tabs */}
          <Card className="p-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">
                  Active ({activeAlerts.length})
                </TabsTrigger>
                <TabsTrigger value="critical">
                  Critical ({criticalAlerts.length})
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved ({resolvedAlerts.length})
                </TabsTrigger>
              </TabsList>

              {/* Active Alerts */}
              <TabsContent value="active" className="mt-4 space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active alerts</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => {
                    const bgColor = alert.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-400' : alert.severity === 'warning' ? 'bg-amber-50 border-l-4 border-amber-400' : 'bg-cyan-50 border-l-4 border-cyan-400'
                    
                    return (
                      <div
                        key={alert.id}
                        className={`p-5 border rounded-lg hover:shadow-md transition-all ${bgColor}`}
                      >
                        <div className="flex items-start gap-4">
                          <AlertIcon severity={alert.severity} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                              </div>
                              <SeverityBadge severity={alert.severity} />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span className="font-medium">{getRelativeTime(alert.timestamp)}</span>
                              <Button 
                                size="sm" 
                                onClick={() => resolveAlert(alert.id)}
                                className={`h-7 font-semibold ${alert.severity === 'critical' ? 'bg-red-500 hover:bg-red-600 text-white' : alert.severity === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                              >
                                {alert.severity === 'info' ? 'Dismiss' : 'Acknowledge'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </TabsContent>

              {/* Critical Alerts */}
              <TabsContent value="critical" className="mt-4 space-y-3">
                {criticalAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No critical alerts</p>
                  </div>
                ) : (
                  criticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <AlertIcon severity={alert.severity} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{getRelativeTime(alert.timestamp)}</span>
                            <Button size="sm" variant="destructive" className="h-7" onClick={() => resolveAlert(alert.id)}>
                              Acknowledge
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Resolved Alerts */}
              <TabsContent value="resolved" className="mt-4 space-y-3">
                {resolvedAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No resolved alerts</p>
                  </div>
                ) : (
                  resolvedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 border border-primary/20 bg-primary/5 rounded-lg opacity-75"
                    >
                      <div className="flex items-start gap-4">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground line-through">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">Resolved {getRelativeTime(alert.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}

      {/* Alert Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Alert Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">In-App Notifications</p>
              <p className="text-xs text-muted-foreground">Receive alerts within the dashboard</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive critical alerts via email</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">SMS Alerts</p>
              <p className="text-xs text-muted-foreground">Critical alerts via SMS (if configured)</p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </div>
  )
}
