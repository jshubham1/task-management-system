'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BellIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    taskReminders: true,
    projectUpdates: true,
    weeklyDigest: false,
  })

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Notification preferences updated')
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Customize your TaskFlow experience
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notifications.email ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notifications.email ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notifications.push ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notifications.push ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Task Reminders</h4>
                  <p className="text-sm text-gray-500">Get reminded about upcoming due dates</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('taskReminders')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notifications.taskReminders ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notifications.taskReminders ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Project Updates</h4>
                  <p className="text-sm text-gray-500">Notifications about project changes</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('projectUpdates')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notifications.projectUpdates ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notifications.projectUpdates ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Weekly Digest</h4>
                  <p className="text-sm text-gray-500">Weekly summary of your activity</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('weeklyDigest')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notifications.weeklyDigest ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notifications.weeklyDigest ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SunIcon className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Theme</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg border-2 transition-colors",
                        theme === 'light'
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <SunIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg border-2 transition-colors",
                        theme === 'dark'
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <MoonIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg border-2 transition-colors",
                        theme === 'system'
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <CogIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Localization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GlobeAltIcon className="h-5 w-5" />
                <span>Localization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value)
                    toast.success('Language preference updated')
                  }}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value)
                    toast.success('Timezone updated')
                  }}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast('Two-factor authentication coming soon')}
              >
                Enable Two-Factor Authentication
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast('Active sessions management coming soon')}
              >
                Manage Active Sessions
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast('API keys management coming soon')}
              >
                API Keys
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
