'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('operator')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/')
      return
    }

    const userData = JSON.parse(user)
    setUserRole(userData.role)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-cyan-50">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full border-4 border-green-200 border-t-green-500 animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50">
      <DashboardNavbar userRole={userRole} onLogout={handleLogout} />
      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on lg screens */}
        <div className="hidden lg:block">
          <DashboardSidebar userRole={userRole} />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
