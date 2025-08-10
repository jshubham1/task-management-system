'use client'

import { motion } from 'framer-motion'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  change: string
  trend: 'up' | 'down'
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red'
  loading?: boolean
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
}

const bgColorVariants = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  yellow: 'bg-yellow-50',
  red: 'bg-red-50',
}

export function StatsCard({ title, value, change, trend, icon, color, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0">
          <div className={cn("h-2 bg-gradient-to-r", colorVariants[color])} />
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {value.toLocaleString()}
                  </p>
                  <div className={cn(
                    "flex items-center text-xs font-medium",
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {trend === 'up' ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {change}
                  </div>
                </div>
              </div>
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full text-2xl",
                bgColorVariants[color]
              )}>
                {icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
