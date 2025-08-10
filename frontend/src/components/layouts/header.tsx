'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { User } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface HeaderProps {
  onMenuClick: () => void
  user: User
}

export function Header({ onMenuClick, user }: HeaderProps) {
  const { logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      toast(`Searching for: ${searchQuery}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <form className="relative flex flex-1" onSubmit={handleSearch}>
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3"
            aria-hidden="true"
          />
          <Input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent"
            placeholder="Search tasks, projects..."
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications button */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">3</span>
            </span>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden lg:flex lg:flex-col lg:items-start">
                  <span className="text-sm font-semibold leading-6 text-gray-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs leading-5 text-gray-500">
                    {user.email}
                  </span>
                </div>
              </div>
            </Menu.Button>

            <AnimatePresence>
              <Menu.Items
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition
                className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>

                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700 transition-colors'
                      )}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Your Profile
                    </a>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700 transition-colors'
                      )}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Settings
                    </a>
                  )}
                </Menu.Item>

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={cn(
                          active ? 'bg-gray-50' : '',
                          'flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </AnimatePresence>
          </Menu>
        </div>
      </div>
    </header>
  )
}
