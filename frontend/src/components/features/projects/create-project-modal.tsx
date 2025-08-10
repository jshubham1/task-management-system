'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProjectSchema, type CreateProjectForm } from '@/lib/validations'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export function CreateProjectModal({ open, onClose, onSuccess }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getAll(),
    enabled: open,
  })

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: colorOptions[0],
    }
  })

  const watchedColor = form.watch('color')
  const watchedMemberIds = selectedMemberIds

  const toggleMember = (userId: string) => {
    setSelectedMemberIds(prev => (
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    ))
  }

  const onSubmit = async (data: CreateProjectForm) => {
    setIsSubmitting(true)
    try {
      await api.projects.create(data)
      toast.success('Project created successfully!')
      form.reset()
      setSelectedMemberIds([])
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedMemberIds([])
    onClose()
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Create New Project
                    </Dialog.Title>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Name *
                        </label>
                        <Input
                          {...form.register('name')}
                          placeholder="Enter project name"
                          className={cn(
                            form.formState.errors.name && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        {form.formState.errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          {...form.register('description')}
                          rows={3}
                          placeholder="Enter project description"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => form.setValue('color', color)}
                              className={cn(
                                "w-8 h-8 rounded-full border-2 transition-all",
                                watchedColor === color
                                  ? "border-gray-900 scale-110"
                                  : "border-gray-300 hover:scale-105"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {form.formState.errors.color && (
                          <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.color.message}
                          </p>
                        )}
                      </div>

                      {/* Team Members */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Members
                        </label>
                        <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-3">
                          {users?.data?.map((user) => (
                            <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={watchedMemberIds.includes(user.id)}
                                onChange={() => toggleMember(user.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex items-center space-x-2">
                                {user.profilePicture ? (
                                  <img
                                    className="h-6 w-6 rounded-full"
                                    src={user.profilePicture}
                                    alt={user.fullName}
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      {user.fullName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <span className="text-sm text-gray-700">{user.fullName}</span>
                                <span className="text-xs text-gray-500">({user.email})</span>
                              </div>
                            </label>
                          ))}
                          {!users?.data?.length && (
                            <p className="text-sm text-gray-500 text-center py-2">
                              No team members available
                            </p>
                          )}
                        </div>
                        {watchedMemberIds.length > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            {watchedMemberIds.length} member{watchedMemberIds.length !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Project'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
