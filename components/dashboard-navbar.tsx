import { Bell, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MobileNav } from '@/components/mobile-nav'

interface DashboardNavbarProps {
  userRole?: string
  onLogout?: () => void
}

export function DashboardNavbar({ userRole = 'operator', onLogout }: DashboardNavbarProps) {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Menu */}
        <MobileNav userRole={userRole} />

        {/* Logo/Title */}
        <div className="flex items-center gap-2 flex-1 md:flex-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">EC</span>
          </div>
          <h1 className="text-base md:text-lg font-bold text-foreground">EcoCoir</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Alerts Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">User Account</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole} Role</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>System Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
