'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiUserPlus,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi'
import { HiBuildingOffice2 } from 'react-icons/hi2'

interface SidebarProps {
  userRole: string
  username: string
  onLogout: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, username, onLogout }) => {
  const pathname = usePathname()
  
  const adminMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { 
      name: 'Hall Data', 
      icon: HiBuildingOffice2,
      submenu: [
        { name: 'Hall 1', href: '/dashboard/hall/1' },
        { name: 'Hall 2', href: '/dashboard/hall/2' },
        { name: 'Hall 3', href: '/dashboard/hall/3' },
      ]
    },
    { name: 'Add User', href: '/dashboard/add-user', icon: FiUserPlus },
    { name: 'User Management', href: '/dashboard/users', icon: FiUsers },
    { 
      name: 'Settings', 
      icon: FiSettings,
      submenu: [
        { name: 'Enable/Disable Users', href: '/dashboard/settings/users' },
        { name: 'System Settings', href: '/dashboard/settings/system' },
      ]
    },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome, {username}</p>
        <p className="text-gray-500 text-xs mt-1 capitalize">Role: {userRole}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {adminMenu.map((item) => (
            <li key={item.name}>
              {item.submenu ? (
                <details className="group">
                  <summary className="flex items-center p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </summary>
                  <ul className="ml-8 mt-2 space-y-2">
                    {item.submenu.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className={`flex items-center p-2 rounded-lg hover:bg-gray-800 ${
                            pathname === sub.href ? 'bg-blue-900 text-blue-300' : ''
                          }`}
                        >
                          <span className="text-sm">{sub.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-800 ${
                    pathname === item.href ? 'bg-blue-900 text-blue-300' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
          
          {/* Logout Button */}
          <li className="absolute bottom-4 left-4 right-4">
            <button
              onClick={onLogout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-red-900 text-red-300"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
