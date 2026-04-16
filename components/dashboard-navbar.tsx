import Image from 'next/image'
import { Bell, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MobileNav } from '@/components/mobile-nav'

interface DashboardNavbarProps {
  userRole?: string
  displayName?: string
  onLogout?: () => void
}

export function DashboardNavbar({ userRole = 'operator', displayName = 'User Account', onLogout }: DashboardNavbarProps) {
  return (
    <nav className="bg-white border-b-2 border-green-100 sticky top-0 z-50 shadow-sm animate-slide-in-down">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
        {/* Mobile Menu */}
        <MobileNav userRole={userRole} />

        {/* Logo/Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 md:flex-none">
          <div className="relative w-9 sm:w-10 h-9 sm:h-10 flex-shrink-0">
            <Image src="/logo.jpg" alt="EcoCoir Logo" fill className="object-contain" priority />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-green-700 truncate">EcoCoir</h1>
            <p className="text-xs text-green-600 font-medium hidden sm:block">Smart Factory</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Alerts Bell */}
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-green-600 hover:bg-green-50 touch-target transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse animate-glow"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-green-600 hover:bg-green-50 touch-target transition-all">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 bg-green-50 rounded-t-md overflow-hidden">
                <p className="text-sm font-bold text-green-700 truncate">{displayName}</p>
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
