'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  FlagIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { Card, CardContent } from '@/components/ui/card'
import { TaskResponse } from '@/types'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { formatDate, cn } from '@/lib/utils'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface TaskCardProps {
  task: TaskResponse
  isDragging?: boolean
  onRefetch: () => void
  dragAttributes?: DraggableAttributes
  dragListeners?: DraggableSyntheticListeners
}

const priorityColors = {
  LOW: 'text-gray-500 bg-gray-100',
  MEDIUM: 'text-blue-500 bg-blue-100',
  HIGH: 'text-orange-500 bg-orange-100',
  CRITICAL: 'text-red-500 bg-red-100',
}

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export function TaskCard({ task, isDragging, onRefetch, dragAttributes, dragListeners }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    setIsDeleting(true)
    try {
      await api.tasks.delete(task.id)
      toast.success('Task deleted successfully')
      onRefetch()
      // Invalidate dashboard queries after deletion
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      queryClient.invalidateQueries({ queryKey: ['project-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
    } catch (error) {
      toast.error('Failed to delete task')
      console.error('Error deleting task:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    // TODO: Open edit modal
    toast('Edit functionality coming soon')
  }

  const isOverdue = task.isOverdue

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={cn(
        "cursor-pointer transition-transform duration-200 will-change-transform hover:shadow-md",
        isDragging && "shadow-xl scale-[1.02]",
        isOverdue && "border-red-200 bg-red-50/50"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 flex items-start gap-2">
              {/* Drag handle */}
              <button
                aria-label="Drag task"
                className="mt-0.5 h-7 w-7 flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                {...dragAttributes}
                {...(dragListeners ?? {})}
                title="Drag"
              >
                <Bars3BottomLeftIcon className="h-5 w-5" />
              </button>
              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Actions Menu */}
            <Menu as="div" className="relative ml-2">
              <Menu.Button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleEdit}
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'flex w-full items-center px-3 py-2 text-sm text-gray-700'
                      )}
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={cn(
                        active ? 'bg-gray-50' : '',
                        'flex w-full items-center px-3 py-2 text-sm text-red-700'
                      )}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.attachments.slice(0, 3).map((attachment) => (
                <span
                  key={attachment.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  📎 {attachment.originalFilename}
                </span>
              ))}
              {task.attachments.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  +{task.attachments.length - 3} files
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {/* Priority */}
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full",
                priorityColors[task.priority]
              )}>
                <FlagIcon className="h-3 w-3" />
                <span className="font-medium">{priorityLabels[task.priority]}</span>
              </div>

              {/* Due Today Indicator */}
              {task.isDueToday && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <span className="text-xs font-medium">📅 Due Today</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={cn(
                "flex items-center space-x-1",
                isOverdue && "text-red-600 font-medium"
              )}>
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>

          {/* Project */}
          {task.projectName && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                📁 {task.projectName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
