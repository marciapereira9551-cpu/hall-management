'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/Layout/AdminLayout'
import { supabase } from '@/lib/supabase'
import { FiUser, FiLock, FiMail } from 'react-icons/fi'

export default function AddUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    confirmPin: '',
    role: 'agent',
    hallNumber: '1',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match')
      return
    }
    
    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }
    
    if (formData.role !== 'admin' && !formData.hallNumber) {
      setError('Please select a hall for non-admin users')
      return
    }
    
    setLoading(true)
    
    try {
      // Get current user (admin creating this user)
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        router.push('/login')
        return
      }
      const adminUser = JSON.parse(storedUser)
      
      // Simple PIN hash (use bcrypt in production!)
      const pinHash = btoa(formData.pin + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      // Insert new user
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          username: formData.username,
          pin_hash: pinHash,
          role: formData.role,
          hall_number: formData.role === 'admin' ? null : parseInt(formData.hallNumber),
          is_active: formData.isActive,
          created_by: adminUser.id
        })
        .select()
        .single()
      
      if (insertError) {
        if (insertError.code === '23505') {
          setError('Username already exists')
        } else {
          setError('Failed to create user: ' + insertError.message)
        }
      } else {
        setSuccess(`User "${formData.username}" created successfully!`)
        setFormData({
          username: '',
          pin: '',
          confirmPin: '',
          role: 'agent',
          hallNumber: '1',
          isActive: true
        })
        
        // Log activity
        await supabase
          .from('activity_logs')
          .insert({
            user_id: adminUser.id,
            action: 'CREATE_USER',
            details: `Created user: ${formData.username} (${formData.role})`
          })
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <AdminLayout user={{ role: 'admin', username: 'Admin' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New User</h1>
          <p className="text-gray-600 mt-2">Create new user accounts with specific roles and permissions</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* PIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4-Digit PIN *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="pin"
                    maxLength={4}
                    value={formData.pin}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter PIN"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPin"
                    maxLength={4}
                    value={formData.confirmPin}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm PIN"
                  />
                </div>
              </div>
            </div>

            {/* Role and Hall */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hall Number {formData.role !== 'admin' && '*'}
                </label>
                <select
                  name="hallNumber"
                  value={formData.hallNumber}
                  onChange={handleChange}
                  disabled={formData.role === 'admin'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="1">Hall 1</option>
                  <option value="2">Hall 2</option>
                  <option value="3">Hall 3</option>
                </select>
                {formData.role === 'admin' && (
                  <p className="text-sm text-gray-500 mt-1">Admin has access to all halls</p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                User is active (can login)
              </label>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/dashboard/users')}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition"
              >
                View All Users
              </button>
            </div>
          </form>
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-800 mb-3">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800">Admin</h4>
              <p className="text-sm text-gray-600 mt-1">Full access to all halls, can create users, manage settings</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800">Supervisor</h4>
              <p className="text-sm text-gray-600 mt-1">Manage specific hall, view reports, manage agents in their hall</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800">Agent</h4>
              <p className="text-sm text-gray-600 mt-1">Limited access to their hall, basic data entry and viewing</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
