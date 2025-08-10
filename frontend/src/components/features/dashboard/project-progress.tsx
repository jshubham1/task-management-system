'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectStats } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectProgressProps {
  data?: ProjectStats[]
  loading?: boolean
}

export function ProjectProgress({ data, loading }: ProjectProgressProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full" style={{ width: '60%' }}></div>
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
        <CardTitle>Project Progress</CardTitle>
        <p className="text-sm text-gray-600">
          Track completion status of your active projects
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data && data.length > 0 ? (
            data.slice(0, 5).map((project, index) => (
              <motion.div
                key={project.projectId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.projectName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.completedTasks} of {project.totalTasks} tasks completed
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(project.progressPercentage)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      project.progressPercentage >= 100 ? "bg-green-500" :
                      project.progressPercentage >= 75 ? "bg-blue-500" :
                      project.progressPercentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progressPercentage}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Create your first project to track progress</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
