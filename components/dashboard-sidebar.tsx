'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Settings, BarChart3, AlertTriangle, Zap, Droplets, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  userRole?: string
}

export function DashboardSidebar({ userRole = 'operator' }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: Activity, label: 'Overview', href: '/dashboard', roles: ['admin', 'operator'] },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', roles: ['admin', 'operator'] },
    { icon: Zap, label: 'Power Management', href: '/dashboard/power', roles: ['admin', 'operator'] },
    { icon: Droplets, label: 'Water Usage', href: '/dashboard/water', roles: ['admin', 'operator'] },
    { icon: AlertTriangle, label: 'Alerts', href: '/dashboard/alerts', roles: ['admin', 'operator'] },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['admin'] },
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole as any))

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen sticky top-16 overflow-y-auto',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Menu Items */}
        <nav className="space-y-2 flex-1">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 transition-colors',
                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
        </Button>
      </div>
    </aside>
  )
}
