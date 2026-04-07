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
    <nav className="bg-white border-b-2 border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Menu */}
        <MobileNav userRole={userRole} />

        {/* Logo/Title */}
        <div className="flex items-center gap-3 flex-1 md:flex-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
            <span className="text-white font-bold text-lg">EC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-green-700">EcoCoir</h1>
            <p className="text-xs text-green-600 font-medium">Smart Factory</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Alerts Bell */}
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-green-600 hover:bg-green-50">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-green-600 hover:bg-green-50">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 bg-green-50 rounded-t-md">
                <p className="text-sm font-bold text-green-700">User Account</p>
                <p className="text-xs text-green-600 capitalize font-medium">{userRole} Role</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-green-50">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-green-50">System Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
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
