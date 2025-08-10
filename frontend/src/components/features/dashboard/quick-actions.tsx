'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, FolderPlusIcon, UserPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateTaskModal } from '@/components/features/tasks/create-task-modal'
import { CreateProjectModal } from '@/components/features/projects/create-project-modal'
import toast from 'react-hot-toast'

const quickActions = [
  {
    title: 'New Task',
    description: 'Create a new task',
    icon: PlusIcon,
    color: 'bg-blue-500 hover:bg-blue-600',
    action: 'create-task'
  },
  {
    title: 'New Project',
    description: 'Start a new project',
    icon: FolderPlusIcon,
    color: 'bg-green-500 hover:bg-green-600',
    action: 'create-project'
  },
  {
    title: 'Invite Member',
    description: 'Add team member',
    icon: UserPlusIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
    action: 'invite-member',
    disabled: true
  },
  {
    title: 'Import Tasks',
    description: 'Import from CSV',
    icon: DocumentPlusIcon,
    color: 'bg-orange-500 hover:bg-orange-600',
    action: 'import-tasks',
    disabled: true
  }
]

export function QuickActions() {
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)

  const handleAction = (action: string) => {
    switch (action) {
      case 'create-task':
        setCreateTaskModalOpen(true)
        break
      case 'create-project':
        setCreateProjectModalOpen(true)
        break
      default:
        break
    }
  }

  const handleTaskCreated = () => {
    setCreateTaskModalOpen(false)
    toast.success('Task created successfully!')
  }

  const handleProjectCreated = () => {
    setCreateProjectModalOpen(false)
    toast.success('Project created successfully!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 w-full border-2 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAction(action.action)}
                disabled={action.disabled}
              >
                <div className={`p-3 rounded-full text-white ${action.color} transition-colors`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>

      {/* Modals */}
      <CreateTaskModal
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onSuccess={handleTaskCreated}
      />

      <CreateProjectModal
        open={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </Card>
  )
}
