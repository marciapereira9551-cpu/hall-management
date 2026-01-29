'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authenticateUser } from '@/lib/auth'
import { FiUser, FiLock } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !pin) {
      setError('Please enter username and PIN')
      setLoading(false)
      return
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 4 digits')
      setLoading(false)
      return
    }

    try {
      const result = await authenticateUser(username, pin)
      
      if (result.success && result.user) {
        // Store user in localStorage (for demo)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', 'demo-token')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access the dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4-Digit PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter 4-digit PIN"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Must be exactly 4 digits</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
              <p className="text-sm text-blue-700 mt-1">Username: <strong>admin</strong></p>
              <p className="text-sm text-blue-700">PIN: <strong>2518</strong></p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Hall Management System</p>
        </div>
      </div>
    </div>
  )
}
