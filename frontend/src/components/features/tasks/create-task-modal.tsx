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
import { Card, CardContent } from '@/components/ui/card'
import { createTaskSchema, type CreateTaskForm } from '@/lib/validations'
import { TaskPriority } from '@/types'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const priorityOptions = [
  { value: 'LOW' as TaskPriority, label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM' as TaskPriority, label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH' as TaskPriority, label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT' as TaskPriority, label: 'Urgent', color: 'bg-red-100 text-red-800' },
]

export function CreateTaskModal({ open, onClose, onSuccess }: CreateTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.getAll(),
    enabled: open,
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getAll(),
    enabled: open,
  })

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
      assigneeId: '',
      projectId: '',
      tags: []
    }
  })

  const watchedTags = form.watch('tags')

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      form.setValue('tags', [...watchedTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const onSubmit = async (data: CreateTaskForm) => {
    setIsSubmitting(true)
    try {
      await api.tasks.create(data)
      toast.success('Task created successfully!')
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setTagInput('')
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
                      Create New Task
                    </Dialog.Title>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <Input
                          {...form.register('title')}
                          placeholder="Enter task title"
                          className={cn(
                            form.formState.errors.title && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        {form.formState.errors.title && (
                          <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.title.message}
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
                          placeholder="Enter task description"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <div className="flex space-x-2">
                          {priorityOptions.map((option) => (
                            <label key={option.value} className="flex items-center cursor-pointer">
                              <input
                                {...form.register('priority')}
                                type="radio"
                                value={option.value}
                                className="sr-only"
                              />
                              <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                form.watch('priority') === option.value
                                  ? option.color + " ring-2 ring-blue-500"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}>
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Due Date and Project */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                          </label>
                          <Input
                            {...form.register('dueDate')}
                            type="date"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project
                          </label>
                          <select
                            {...form.register('projectId')}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select project</option>
                            {projects?.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Assignee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assignee
                        </label>
                        <select
                          {...form.register('assigneeId')}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Assign to someone</option>
                          {users?.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags
                        </label>
                        <div className="flex space-x-2 mb-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a tag"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddTag}
                            disabled={!tagInput.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        {watchedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {watchedTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
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
                          {isSubmitting ? 'Creating...' : 'Create Task'}
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
