'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Activity, BarChart3, Zap, Droplets, AlertTriangle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface MobileNavProps {
  userRole?: string
}

export function MobileNav({ userRole = 'operator' }: MobileNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: Activity, label: 'Overview', href: '/dashboard', roles: ['admin', 'operator'] },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', roles: ['admin', 'operator'] },
    { icon: Zap, label: 'Power', href: '/dashboard/power', roles: ['admin', 'operator'] },
    { icon: Droplets, label: 'Water', href: '/dashboard/water', roles: ['admin', 'operator'] },
    { icon: AlertTriangle, label: 'Alerts', href: '/dashboard/alerts', roles: ['admin', 'operator'] },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['admin'] },
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole as any))

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">EcoCoir</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
