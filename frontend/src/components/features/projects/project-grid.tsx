'use client'

import { motion } from 'framer-motion'
import { 
  EllipsisHorizontalIcon,
  UserGroupIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectResponse } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface ProjectGridProps {
  projects: ProjectResponse[]
  loading?: boolean
  onRefetch: () => void
}

export function ProjectGrid({ projects, loading, onRefetch }: ProjectGridProps) {
  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated tasks.`)) {
      return
    }
    
    try {
      await api.projects.delete(projectId)
      toast.success('Project deleted successfully')
      onRefetch()
    } catch (error) {
      toast.error('Failed to delete project')
      console.error('Error deleting project:', error)
    }
  }

  const handleEdit = (projectId: string) => {
    // TODO: Open edit modal
    toast('Edit functionality coming soon')
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first project</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => {
        const completedTasks = 0
        const totalTasks = 0
        const progress = 0

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4" 
                  style={{ borderLeftColor: project.color }}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  
                  {/* Actions Menu */}
                  <Menu as="div" className="relative ml-2">
                    <Menu.Button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleEdit(project.id)}
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
                            onClick={() => handleDelete(project.id, project.name)}
                            className={cn(
                              active ? 'bg-gray-50' : '',
                              'flex w-full items-center px-3 py-2 text-sm text-red-700'
                            )}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ backgroundColor: project.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
                    <div className="text-xs text-gray-500">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>0 members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
