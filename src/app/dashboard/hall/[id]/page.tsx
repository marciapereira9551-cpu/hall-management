'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/Layout/AdminLayout'
import { supabase } from '@/lib/supabase'
import { FiCalendar, FiUsers, FiActivity, FiPlus } from 'react-icons/fi'

export default function HallPage() {
  const params = useParams()
  const router = useRouter()
  const hallId = params.id as string
  const [hallData, setHallData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRecords: 0,
    todayRecords: 0,
    activeAgents: 0
  })

  useEffect(() => {
    if (hallId && ['1', '2', '3'].includes(hallId)) {
      fetchHallData()
    } else {
      router.push('/dashboard')
    }
  }, [hallId])

  const fetchHallData = async () => {
    try {
      // Fetch hall data
      const { data, error } = await supabase
        .from('hall_data')
        .select('*')
        .eq('hall_number', parseInt(hallId))
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setHallData(data || [])
      
      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayRecords = data?.filter(record => 
        new Date(record.created_at) >= today
      ).length || 0
      
      setStats({
        totalRecords: data?.length || 0,
        todayRecords,
        activeAgents: 0 // You can fetch actual agents count
      })
    } catch (error) {
      console.error('Error fetching hall data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout user={{ role: 'admin', username: 'Admin' }}>
      {/* Hall Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Hall {hallId} Management
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all data for Hall {hallId}
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
            <FiPlus className="mr-2" />
            Add Record
          </button>
        </div>
      </div>

      {/* Hall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FiCalendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalRecords}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Records</p>
              <p className="text-2xl font-bold text-gray-800">{stats.todayRecords}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeAgents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Hall {hallId} Data Records</h2>
        </div>
        
        {hallData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hallData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.data_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof record.data_value === 'object' 
                        ? JSON.stringify(record.data_value)
                        : record.data_value
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      User #{record.created_by?.slice(0, 8) || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiCalendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data records yet</h3>
            <p className="text-gray-500">Start by adding your first record for Hall {hallId}</p>
          </div>
        )}
      </div>

      {/* Quick Notes */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-medium text-yellow-800 mb-2">About Hall {hallId}</h3>
        <p className="text-sm text-yellow-700">
          This is where you can manage all data for Hall {hallId}. You can add new records,
          view existing data, and generate reports. Each hall operates independently with its own
          supervisors and agents.
        </p>
      </div>
    </AdminLayout>
  )
}
