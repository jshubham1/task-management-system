'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PlusIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { ProjectGrid } from '@/components/features/projects/project-grid'
import { ProjectList } from '@/components/features/projects/project-list'
import { CreateProjectModal } from '@/components/features/projects/create-project-modal'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ApiResponse, ProjectListResponse, ProjectSummaryListResponse } from '@/types'

type ViewMode = 'grid' | 'list'

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: projectsResp, isLoading, refetch } = useQuery<ApiResponse<ProjectListResponse>>({
    queryKey: ['projects'],
    queryFn: () => api.projects.getAll(),
    refetchOnWindowFocus: false,
  })

  const { data: projectSummariesResp } = useQuery<ApiResponse<ProjectSummaryListResponse>>({
    queryKey: ['project-summaries'],
    queryFn: () => api.projects.getSummaries(),
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
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Organize your work into projects and track progress
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span>Grid</span>
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

            {/* Create Project Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📁</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-lg font-semibold text-gray-900">
                {projectsResp?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {projectSummariesResp?.data?.filter((p) => p.progress === 100).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⏳</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {projectSummariesResp?.data?.filter((p) => p.progress > 0 && p.progress < 100).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-semibold">📋</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-lg font-semibold text-gray-900">
                {projectSummariesResp?.data?.reduce((sum, p) => sum + p.totalTasks, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'grid' ? (
          <ProjectGrid 
            projects={projectsResp?.data || []} 
            loading={isLoading} 
            onRefetch={refetch}
          />
        ) : (
          <ProjectList 
            projects={projectsResp?.data || []} 
            loading={isLoading} 
            onRefetch={refetch}
          />
        )}
      </motion.div>

      {/* Create Project Modal */}
      <CreateProjectModal
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
