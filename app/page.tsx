'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Mock authentication - accept any email/password
    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // Store user session in localStorage for demo
      localStorage.setItem('user', JSON.stringify({ email, role: email.includes('admin') ? 'admin' : 'operator' }))
      router.push('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-green-100">
        <div className="p-8">
          {/* Header with Gradient */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">EC</span>
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="block mb-2 text-gray-700 font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@ecocoir.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block mb-2 text-gray-700 font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-5 bg-gradient-to-br from-green-50 to-cyan-50 border-2 border-green-200 rounded-xl">
            <p className="text-xs font-bold text-green-700 mb-3 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">👤</span>
                <p><span className="font-semibold text-gray-700">Operator:</span> <code className="bg-white px-2 py-1 rounded text-green-600 font-mono">operator@ecocoir.com</code></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">🔐</span>
                <p><span className="font-semibold text-gray-700">Admin:</span> <code className="bg-white px-2 py-1 rounded text-green-600 font-mono">admin@ecocoir.com</code></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">🔑</span>
                <p><span className="font-semibold text-gray-700">Password:</span> <code className="bg-white px-2 py-1 rounded text-green-600 font-mono">any password</code></p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
