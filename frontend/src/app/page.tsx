'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login after showing the landing page briefly
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  const features = [
    {
      icon: <CheckCircleIcon className="h-8 w-8" />,
      title: 'Task Management',
      description: 'Create, organize, and track tasks with ease'
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: 'Project Tracking',
      description: 'Monitor project progress and deadlines'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: 'Team Collaboration',
      description: 'Work together with your team seamlessly'
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: 'Analytics',
      description: 'Get insights into your productivity'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            TaskFlow
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, intuitive task management system built with Next.js, React 19, and TypeScript.
            Streamline your workflow and boost productivity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/register')}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Create Account
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100"
            >
              <div className="text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Built with Modern Technology
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="bg-white px-4 py-2 rounded-full shadow border">Next.js 15</span>
            <span className="bg-white px-4 py-2 rounded-full shadow border">React 19</span>
            <span className="bg-white px-4 py-2 rounded-full shadow border">TypeScript</span>
            <span className="bg-white px-4 py-2 rounded-full shadow border">Tailwind CSS</span>
            <span className="bg-white px-4 py-2 rounded-full shadow border">Framer Motion</span>
            <span className="bg-white px-4 py-2 rounded-full shadow border">Zustand</span>
          </div>
        </motion.div>

        {/* Auto-redirect notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <p className="text-sm">Redirecting to login in 3 seconds...</p>
        </motion.div>
      </div>
    </div>
  )
}
