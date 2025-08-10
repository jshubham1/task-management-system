'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  UserIcon, 
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { TaskResponse, TaskStatus } from '@/types'
import { formatDate, formatRelativeTime, cn } from '@/lib/utils'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface TaskListProps {
  tasks: TaskResponse[]
  loading?: boolean
  onRefetch: () => void
}

const statusIcons = {
  TODO: ClockIcon,
  IN_PROGRESS: ExclamationTriangleIcon,
  DONE: CheckCircleIcon,
  CANCELLED: XMarkIcon,
}

const statusColors = {
  TODO: 'text-gray-500 bg-gray-100',
  IN_PROGRESS: 'text-blue-500 bg-blue-100',
  DONE: 'text-green-500 bg-green-100',
  CANCELLED: 'text-red-500 bg-red-100',
}

const priorityColors = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
}

export function TaskList({ tasks, loading, onRefetch }: TaskListProps) {
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set())

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId))
    
    try {
      await api.tasks.updateStatus(taskId, newStatus)
      toast.success('Task status updated')
      onRefetch()
    } catch (error) {
      toast.error('Failed to update task status')
      console.error('Error updating task status:', error)
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          All Tasks ({tasks.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const StatusIcon = statusIcons[task.status]
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
            const isUpdating = updatingTasks.has(task.id)
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "px-6 py-4 hover:bg-gray-50 transition-colors",
                  isOverdue && "bg-red-50/50 border-l-4 border-red-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-3">
                      {/* Status Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5",
                        statusColors[task.status]
                      )}>
                        <StatusIcon className="h-3 w-3" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h4>
                          
                          {/* Priority Flag */}
                          <FlagIcon className={cn("h-4 w-4", priorityColors[task.priority])} />
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {/* Project ID */}
                          {task.projectId && (
                            <span className="flex items-center space-x-1">
                              <span>📁</span>
                              <span>Project {task.projectId}</span>
                            </span>
                          )}
                          
                          {/* Created Date */}
                          <span>Created {formatRelativeTime(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    {/* Attachments */}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex space-x-1">
                        <span className="text-xs text-gray-500">
                          📎 {task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    
                    {/* Due Date */}
                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center space-x-1 text-xs",
                        isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                      )}>
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    
                    {/* Status Selector */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      disabled={isUpdating}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-sm">Create your first task or adjust your filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
