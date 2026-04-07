'use client'

import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Alert {
  id: string
  type: 'overload' | 'underusage' | 'sensor' | 'maintenance'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  status: 'active' | 'resolved'
  actionRequired: boolean
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'overload',
    severity: 'critical',
    title: 'Machine Overload Detected',
    description: 'Line 2 load exceeded safe threshold (95%). Conveyor belt stopped for 8 seconds.',
    timestamp: '2 minutes ago',
    status: 'active',
    actionRequired: true,
  },
  {
    id: '2',
    type: 'maintenance',
    severity: 'warning',
    title: 'Preventive Maintenance Due',
    description: 'Machine 3 maintenance scheduled in 48 hours. Please plan downtime.',
    timestamp: '1 hour ago',
    status: 'active',
    actionRequired: true,
  },
  {
    id: '3',
    type: 'sensor',
    severity: 'warning',
    title: 'Sensor Data Inconsistency',
    description: 'Temperature sensor on Line 1 showing unusual readings. Check calibration.',
    timestamp: '3 hours ago',
    status: 'active',
    actionRequired: true,
  },
  {
    id: '4',
    type: 'underusage',
    severity: 'info',
    title: 'Low Machine Utilization',
    description: 'Line 1 operating at 35% capacity. Consider increasing feed rate.',
    timestamp: '5 hours ago',
    status: 'active',
    actionRequired: false,
  },
  {
    id: '5',
    type: 'overload',
    severity: 'critical',
    title: 'Previous Overload Resolved',
    description: 'Load on Line 2 returned to normal operating range.',
    timestamp: '6 hours ago',
    status: 'resolved',
    actionRequired: false,
  },
]

function AlertIcon({ severity }: { severity: string }) {
  const icons = {
    critical: <AlertTriangle className="h-5 w-5 text-destructive" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <CheckCircle className="h-5 w-5 text-primary" />,
  }
  return icons[severity as keyof typeof icons] || icons.warning
}

function SeverityBadge({ severity }: { severity: string }) {
  const badges = {
    critical: <Badge variant="destructive" className="capitalize">{severity}</Badge>,
    warning: <Badge className="bg-yellow-500/20 text-yellow-600 capitalize">{severity}</Badge>,
    info: <Badge variant="secondary" className="capitalize">{severity}</Badge>,
  }
  return badges[severity as keyof typeof badges]
}

export default function AlertsPage() {
  const activeAlerts = mockAlerts.filter(a => a.status === 'active')
  const resolvedAlerts = mockAlerts.filter(a => a.status === 'resolved')
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'active')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">System Alerts</h1>
        <p className="text-muted-foreground">Monitor and manage all system alerts and notifications</p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
              <p className="text-3xl font-bold text-foreground">{activeAlerts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Critical Issues</p>
              <p className="text-3xl font-bold text-destructive">{criticalAlerts.length}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Resolved</p>
              <p className="text-3xl font-bold text-primary">{resolvedAlerts.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-primary opacity-20" />
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
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <AlertIcon severity={alert.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        </div>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.timestamp}</span>
                        {alert.actionRequired && (
                          <Button size="sm" variant="outline" className="h-7">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
                        <span>{alert.timestamp}</span>
                        <Button size="sm" variant="destructive" className="h-7">
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
                      <p className="text-xs text-muted-foreground mt-2">Resolved {alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </Card>

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
