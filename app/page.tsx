'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { user, loginWithGoogle, loading } = useAuth()
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoggingIn(true)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.')
      setIsLoggingIn(false)
    }
  }

  // Prevent flashing login screen if user is already authenticated
  if (loading || (user && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50">
        <div className="h-16 w-16 rounded-full border-4 border-green-200 border-t-green-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-green-100">
        <div className="p-8">
          {/* Header with Gradient */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <Image src="/logo.jpg" alt="EcoCoir Logo" fill className="object-contain drop-shadow-md" priority />
            </div>
            <h1 className="text-4xl font-bold text-green-700 mb-2">EcoCoir</h1>
            <p className="text-green-600 font-medium">Smart Factory Dashboard</p>
            <p className="text-gray-500 text-sm mt-2">Real-time IoT Monitoring</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login Options */}
          <div className="space-y-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.71 17.59V20.35H19.28C21.36 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23.0001C14.97 23.0001 17.46 22.0201 19.28 20.3501L15.71 17.5901C14.72 18.2501 13.48 18.6601 12 18.6601C9.14 18.6601 6.71 16.7301 5.84 14.1401H2.18V16.9801C3.99 20.5701 7.7 23.0001 12 23.0001Z" fill="#34A853"/>
                <path d="M5.84 14.1399C5.62 13.4799 5.5 12.7599 5.5 11.9999C5.5 11.2399 5.62 10.5199 5.84 9.85986V7.01986H2.18C1.43 8.50986 1 10.1999 1 11.9999C1 13.7999 1.43 15.4899 2.18 16.9799L5.84 14.1399Z" fill="#FBBC05"/>
                <path d="M12 5.34C13.62 5.34 15.07 5.89 16.22 6.98L19.36 3.84C17.46 2.08 14.97 1 12 1C7.7 1 3.99 3.43 2.18 7.02L5.84 9.86C6.71 7.27 9.14 5.34 12 5.34Z" fill="#EA4335"/>
              </svg>
              {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
            By continuing, you agree to EcoCoir's automated tracking monitoring policy.
          </div>
        </div>
      </Card>
    </div>
  )
}
