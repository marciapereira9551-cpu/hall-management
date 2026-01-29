'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
  user: any
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user }) => {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    // Clear session
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        userRole={user?.role || 'admin'} 
        username={user?.username || 'Admin'}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
