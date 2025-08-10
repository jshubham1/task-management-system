'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  PlusCircleIcon, 
  FolderPlusIcon,
  PencilSquareIcon 
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityResponse } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecentActivityProps {
  data?: ActivityResponse[]
  loading?: boolean
}

const activityIcons = {
  TASK_CREATED: PlusCircleIcon,
  TASK_COMPLETED: CheckCircleIcon,
  TASK_UPDATED: PencilSquareIcon,
  PROJECT_CREATED: FolderPlusIcon,
}

const activityColors = {
  TASK_CREATED: 'text-blue-500 bg-blue-50',
  TASK_COMPLETED: 'text-green-500 bg-green-50',
  TASK_UPDATED: 'text-yellow-500 bg-yellow-50',
  PROJECT_CREATED: 'text-purple-500 bg-purple-50',
}

export function RecentActivity({ data, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-gray-600">
          Latest updates from your tasks and projects
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((activity, index) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || PlusCircleIcon
              const colorClass = activityColors[activity.type as keyof typeof activityColors] || 'text-gray-500 bg-gray-50'
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    colorClass
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                      <time>{activity.timeAgo}</time>
                      <span>•</span>
                      <span className="font-medium">{activity.entityName}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No recent activity</p>
                <p className="text-sm">Start creating tasks and projects to see activity</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
