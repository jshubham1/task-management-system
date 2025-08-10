'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TaskChart } from '@/components/features/dashboard/task-chart'
import { RecentActivity } from '@/components/features/dashboard/recent-activity'
import { ProjectProgress } from '@/components/features/dashboard/project-progress'
import { QuickActions } from '@/components/features/dashboard/quick-actions'
import { api } from '@/lib/api'
import { RecentStats } from '@/components/features/dashboard/recent-stats'

export default function DashboardPage() {
  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => api.dashboard.getTaskStats({ days: 30 }),
  })

  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: () => api.dashboard.getProjectStats(),
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.dashboard.getRecentActivity({ limit: 10 }),
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back! Here&apos;s what&apos;s happening with your tasks and projects.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <RecentStats />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <QuickActions />
      </motion.div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TaskChart data={taskStats?.dailyStats} loading={!taskStats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ProjectProgress data={projectStats?.projectProgress} loading={!projectStats} />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RecentActivity data={recentActivity} loading={!recentActivity} />
      </motion.div>
    </div>
  )
}
