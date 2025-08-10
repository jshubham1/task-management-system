'use client'

import { motion } from 'framer-motion'
import { 
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { ProjectResponse } from '@/types'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface ProjectListProps {
  projects: ProjectResponse[]
  loading?: boolean
  onRefetch: () => void
}

export function ProjectList({ projects, loading, onRefetch }: ProjectListProps) {
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

  const handleEdit = () => {
    // TODO: Open edit modal
    toast('Edit functionality coming soon')
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
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
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

  if (projects.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📁</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500">Get started by creating your first project</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          All Projects ({projects.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {projects.map((project, index) => {
          const completedTasks = 0
          const totalTasks = 0
          const progress = 0
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-6 hover:bg-gray-50 transition-colors border-l-4"
              style={{ borderLeftColor: project.color }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h4>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
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
                        transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
                      />
                    </div>
                  </div>
                  
                  {/* Owner section omitted: owner field not available on ProjectResponse */}
                </div>
                
                <div className="flex items-center space-x-4 ml-6">
                  {/* Stats */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{totalTasks}</div>
                    <div className="text-xs text-gray-500">Tasks</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-gray-500">Done</div>
                  </div>
                  
                  {/* Actions Menu */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleEdit()}
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
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
