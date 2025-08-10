'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { TaskBoard } from '@/components/features/tasks/task-board'
import { TaskList } from '@/components/features/tasks/task-list'
import { TaskFilters } from '@/components/features/tasks/task-filters'
import { CreateTaskModal } from '@/components/features/tasks/create-task-modal'
import { useTaskFilters } from '@/hooks/use-task-filters'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ApiResponse, TaskFilterRequest, TaskListResponse } from '@/types'

type ViewMode = 'board' | 'list'

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useTaskFilters()

  const { data: tasksResp, isLoading, refetch } = useQuery<ApiResponse<TaskListResponse>>({
    queryKey: ['tasks', filters],
    queryFn: () => {
      const req: TaskFilterRequest = {
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        status: filters.status,
        priority: filters.priority,
        projectId: Array.isArray(filters.projectId)
          ? filters.projectId[0]
          : filters.projectId,
        search: filters.search,
      }
      return api.tasks.getAll(req)
    },
    refetchOnWindowFocus: false,
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:flex sm:items-center sm:justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track your tasks across all projects
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('board')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1',
                  viewMode === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span>List</span>
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center space-x-2',
                (showFilters || hasActiveFilters) && 'bg-blue-50 border-blue-200 text-blue-700'
              )}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {Object.values(filters).flat().filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* Create Task Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <TaskFilters
              filters={filters}
              onFilterChange={updateFilter}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'board' ? (
          <TaskBoard tasks={tasksResp?.data?.content || []} loading={isLoading} onRefetch={refetch} />
        ) : (
          <TaskList tasks={tasksResp?.data?.content || []} loading={isLoading} onRefetch={refetch} />
        )}
      </motion.div>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetch()
          setShowCreateModal(false)
        }}
      />
    </div>
  )
}
