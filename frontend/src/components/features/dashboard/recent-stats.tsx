
'use client'

import { motion } from 'framer-motion'
import { StatsCard } from '@/components/features/dashboard/stats-card'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function RecentStats() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.dashboard.getSummary(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const statsCards = [
    {
      title: 'Total Tasks',
      value: summary?.totalTasks || 0,
      icon: '📋',
      color: 'blue' as const
    },
    {
      title: 'Completed',
      value: summary?.completedTasks || 0,
      icon: '✅',
      color: 'green' as const
    },
    {
      title: 'In Progress',
      value: summary?.pendingTasks || 0,
      icon: '⏳',
      color: 'yellow' as const
    },
    {
      title: 'Overdue',
      value: summary?.overdueTasks || 0,
      icon: '⚠️',
      color: 'red' as const
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
    >
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <StatsCard {...stat} loading={summaryLoading} />
        </motion.div>
      ))}
    </motion.div>
  )
}
