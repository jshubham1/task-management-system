'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  // Users API is not available yet on the backend. Hide team members UI for now.

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: colorOptions[0],
    }
  })

  const watchedColor = form.watch('color')

  const onSubmit = async (data: CreateProjectForm) => {
    setIsSubmitting(true)
    try {
      await api.projects.create(data)
      toast.success('Project created successfully!')
      form.reset()
      onSuccess()
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      queryClient.invalidateQueries({ queryKey: ['project-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
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

                      {/* Team Members (temporarily disabled) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Members
                        </label>
                        <div className="rounded-md border border-dashed border-gray-300 p-3 bg-gray-50 text-sm text-gray-600">
                          Team member selection will be available once the user directory API is implemented.
                        </div>
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
