'use client'

import { Settings, Bell, Lock, User, Database, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
        <p className="text-muted-foreground">Manage factory dashboard configuration and preferences</p>
      </div>

      {/* Success Message */}
      {isSaved && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex gap-3">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">Settings saved successfully</p>
        </div>
      )}

      {/* Settings Tabs */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="factory-name">Factory Name</Label>
                  <Input
                    id="factory-name"
                    defaultValue="EcoCoir Processing Plant"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="factory-location">Location</Label>
                  <Input
                    id="factory-location"
                    defaultValue="Kerala, India"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select className="mt-2 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option>Asia/Kolkata (IST)</option>
                    <option>Asia/Bangkok</option>
                    <option>Asia/Singapore</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="lang">Language</Label>
                  <select className="mt-2 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option>English</option>
                    <option>Malayalam</option>
                    <option>Hindi</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select className="mt-2 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option>INR - Indian Rupee</option>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </TabsContent>

          {/* Alert Settings */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert Configuration
              </h3>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">Overload Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when machine load exceeds 90%</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div>
                    <Label htmlFor="overload-threshold">Threshold (%)</Label>
                    <Input
                      id="overload-threshold"
                      type="number"
                      defaultValue={90}
                      min={50}
                      max={100}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">Underusage Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when machine load below 30%</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div>
                    <Label htmlFor="underusage-threshold">Threshold (%)</Label>
                    <Input
                      id="underusage-threshold"
                      type="number"
                      defaultValue={30}
                      min={0}
                      max={50}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">Maintenance Alerts</p>
                      <p className="text-xs text-muted-foreground">Scheduled maintenance reminders</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">Sensor Failure Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify on sensor connection loss</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Notification Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">In-App Notifications</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email Notifications</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">SMS Notifications</span>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Alert Settings
            </Button>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </h3>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-4">Change Password</p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="current-pwd">Current Password</Label>
                      <Input
                        id="current-pwd"
                        type="password"
                        placeholder="••••••••"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-pwd">New Password</Label>
                      <Input
                        id="new-pwd"
                        type="password"
                        placeholder="••••••••"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-pwd">Confirm Password</Label>
                      <Input
                        id="confirm-pwd"
                        type="password"
                        placeholder="••••••••"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Two-Factor Authentication</p>
                      <p className="text-xs text-yellow-600 mt-1">Not yet configured. Enable for enhanced security.</p>
                      <Button size="sm" variant="outline" className="mt-3 text-yellow-600 border-yellow-600 hover:bg-yellow-500/10">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-3">Active Sessions</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Session (Chrome, Windows)</span>
                      <span className="text-primary">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mobile App (iOS)</span>
                      <span className="text-muted-foreground">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Update Security Settings
            </Button>
          </TabsContent>

          {/* Data & Integration Settings */}
          <TabsContent value="data" className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data & Integration
              </h3>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">IoT Sensor Configuration</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Data Update Frequency</p>
                      <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                        <option>Every 1 second (Recommended)</option>
                        <option>Every 2 seconds</option>
                        <option>Every 5 seconds</option>
                        <option>Every 10 seconds</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">MQTT Broker</p>
                      <Input defaultValue="mqtt.ecocoir.io" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-3">Data Retention Policy</p>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option>Keep data indefinitely</option>
                    <option>Keep data for 1 year</option>
                    <option>Keep data for 6 months</option>
                    <option>Keep data for 3 months</option>
                  </select>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground mb-3">API Access</p>
                  <div className="flex gap-2">
                    <Input defaultValue="sk_live_4eC39HqLyjWDarht" readOnly className="text-xs" />
                    <Button variant="outline" size="sm">Copy</Button>
                  </div>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="font-medium text-red-600 mb-3">Danger Zone</p>
                  <Button variant="destructive" className="w-full">
                    Reset All Data
                  </Button>
                  <p className="text-xs text-red-600 mt-2">This action cannot be undone. All historical data will be permanently deleted.</p>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Data Settings
            </Button>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Admin Users (Admin only) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management
        </h2>

        <div className="space-y-3">
          <div className="p-4 border border-border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">admin@ecocoir.com</p>
              <p className="text-xs text-muted-foreground">Administrator • Last login: today</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="p-4 border border-border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">operator@ecocoir.com</p>
              <p className="text-xs text-muted-foreground">Operator • Last login: yesterday</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="p-4 border border-border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">maintenance@ecocoir.com</p>
              <p className="text-xs text-muted-foreground">Maintenance • Last login: 2 days ago</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </div>

        <Button className="w-full mt-4">
          Add New User
        </Button>
      </Card>
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}
