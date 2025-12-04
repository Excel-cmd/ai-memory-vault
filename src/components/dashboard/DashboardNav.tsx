'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface DashboardNavProps {
  userEmail: string
}

export default function DashboardNav({ userEmail }: DashboardNavProps) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/memories', label: 'Memories', icon: '🧠' },
    { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
    { href: '/dashboard/upload-prd', label: 'Upload PRD', icon: '📄' },
    { href: '/dashboard/chat', label: 'Chat', icon: '💬' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden md:block">
              Memory Vault
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden lg:block">{userEmail}</span>
            <form action="/api/auth/logout" method="POST">
              <button className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}