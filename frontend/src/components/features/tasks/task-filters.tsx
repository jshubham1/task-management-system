'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority } from '@/types'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFilterChange: (key: keyof TaskFiltersType, value: any) => void
  onReset: () => void
  hasActiveFilters: boolean
}

const statusOptions = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const priorityOptions = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
]

export function TaskFilters({ filters, onFilterChange, onReset, hasActiveFilters }: TaskFiltersProps) {
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.getAll(),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getAll(),
  })

  const toggleSingleFilter = (key: keyof TaskFiltersType, value: string) => {
    const currentValue = filters[key]
    // If same value is selected, clear it; otherwise set the new value
    const newValue = currentValue === value ? undefined : value
    onFilterChange(key, newValue)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <Input
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.status === option.value}
                    onChange={() => toggleSingleFilter('status', option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    option.color
                  )}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={filters.priority === option.value}
                    onChange={() => toggleSingleFilter('priority', option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    option.color
                  )}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Projects</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {projects?.map((project) => (
                <label key={project.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.projectId || []).includes(project.id)}
                    onChange={() => toggleArrayFilter('projectId', project.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 truncate">
                    {project.name}
                  </span>
                </label>
              ))}
              {!projects?.length && (
                <p className="text-sm text-gray-500">No projects found</p>
              )}
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date Range</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From</label>
              <Input
                type="date"
                value={filters.dueDate?.from || ''}
                onChange={(e) => onFilterChange('dueDate', {
                  ...filters.dueDate,
                  from: e.target.value
                })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <Input
                type="date"
                value={filters.dueDate?.to || ''}
                onChange={(e) => onFilterChange('dueDate', {
                  ...filters.dueDate,
                  to: e.target.value
                })}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFilterChange('search', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                  <button
                    onClick={() => toggleSingleFilter('status', filters.status)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.priority && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Priority: {priorityOptions.find(p => p.value === filters.priority)?.label}
                  <button
                    onClick={() => toggleSingleFilter('priority', filters.priority)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
