'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/Layout/AdminLayout'
import { 
  FiUsers, 
  FiBuilding, 
  FiActivity,
  FiTrendingUp 
} from 'react-icons/fi'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    hallDataCount: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    
    setUser(JSON.parse(storedUser))
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch active users
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch hall data count
      const { count: hallDataCount } = await supabase
        .from('hall_data')
        .select('*', { count: 'exact', head: true })

      // Fetch recent activity (last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const { count: recentActivity } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        hallDataCount: hallDataCount || 0,
        recentActivity: recentActivity || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout user={user}>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, <span className="font-semibold text-blue-600">{user.username}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={stats.totalUsers}
          color="blue"
          change="+12%"
        />
        <StatCard
          icon={FiUsers}
          title="Active Users"
          value={stats.activeUsers}
          color="green"
          change="+8%"
        />
        <StatCard
          icon={FiBuilding}
          title="Hall Records"
          value={stats.hallDataCount}
          color="purple"
          change="+15%"
        />
        <StatCard
          icon={FiActivity}
          title="Recent Activity"
          value={stats.recentActivity}
          color="orange"
          change="+20%"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/add-user')}
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            <FiUsers className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-800">Add New User</h3>
            <p className="text-sm text-gray-600">Create user accounts</p>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/hall/1')}
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition"
          >
            <FiBuilding className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-800">View Hall 1</h3>
            <p className="text-sm text-gray-600">Check hall data</p>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/settings/users')}
            className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition"
          >
            <FiTrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-800">Manage Users</h3>
            <p className="text-sm text-gray-600">Enable/disable users</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem
            user="Admin"
            action="Logged in"
            time="2 minutes ago"
            type="login"
          />
          <ActivityItem
            user="System"
            action="Database backup completed"
            time="1 hour ago"
            type="system"
          />
          <ActivityItem
            user="Admin"
            action="Created new user: supervisor1"
            time="3 hours ago"
            type="create"
          />
        </div>
      </div>
    </AdminLayout>
  )
}

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, color, change }: any) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm text-green-600 font-medium">{change}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mt-4">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </div>
  )
}

// Activity Item Component
const ActivityItem = ({ user, action, time, type }: any) => {
  const typeColors = {
    login: 'bg-blue-100 text-blue-800',
    system: 'bg-gray-100 text-gray-800',
    create: 'bg-green-100 text-green-800'
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors]}`}>
          {type}
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-800">
            <span className="font-semibold">{user}</span> {action}
          </p>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
    </div>
  )
}
