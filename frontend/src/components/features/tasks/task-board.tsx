'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskCard } from './task-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Task, TaskStatus } from '@/types'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TaskBoardProps {
  tasks: Task[]
  loading?: boolean
  onRefetch: () => void
}

const columns = [
  { 
    id: 'TODO' as TaskStatus, 
    title: 'To Do', 
    color: 'bg-gray-100 border-gray-200',
    headerColor: 'text-gray-700'
  },
  { 
    id: 'IN_PROGRESS' as TaskStatus, 
    title: 'In Progress', 
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'text-blue-700'
  },
  { 
    id: 'DONE' as TaskStatus, 
    title: 'Done', 
    color: 'bg-green-50 border-green-200',
    headerColor: 'text-green-700'
  }
]

// Sortable Task Item Component
interface SortableTaskItemProps {
  task: Task
  onRefetch: () => void
}

function SortableTaskItem({ task, onRefetch }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? transition + ' cubic-bezier(0.2, 0.8, 0.2, 1)' : undefined,
    willChange: 'transform',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onRefetch={onRefetch}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}

// Droppable column wrapper to allow dropping into empty space reliably
function DroppableColumn({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  )
}

export function TaskBoard({ tasks, loading, onRefetch }: TaskBoardProps) {
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 120,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group tasks by status
  const currentTasks = useMemo(() => (optimisticTasks.length > 0 ? optimisticTasks : tasks), [tasks, optimisticTasks])

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = currentTasks.filter(task => task.status === column.id)
      return acc
    }, {} as Record<TaskStatus, Task[]>)
  }, [currentTasks])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the task being dragged from the latest list
    const draggedTask = currentTasks.find(task => task.id === activeId)
    if (!draggedTask) return

    // Determine the new status based on the drop zone
    let newStatus: TaskStatus
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '') as TaskStatus
    } else {
      // Dropped on another task, find that task's status from the latest list
      const targetTask = currentTasks.find(task => task.id === overId)
      newStatus = targetTask?.status || draggedTask.status
    }

    // If status hasn't changed, do nothing
    if (newStatus === draggedTask.status) return

    // Optimistic update
    const updatedTasks = currentTasks.map(task =>
      task.id === activeId ? { ...task, status: newStatus } : task
    )
    setOptimisticTasks(updatedTasks)

    try {
      await api.tasks.updateStatus(activeId, newStatus)
      toast.success('Task status updated')
      onRefetch()
      // Invalidate dashboard caches to sync cards, charts, and activity
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      queryClient.invalidateQueries({ queryKey: ['project-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
    } catch {
      // Revert optimistic update on error
      setOptimisticTasks([])
      toast.error('Failed to update task status')
    }
    setActiveId(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${column.headerColor}`}>
                {column.title}
              </h3>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className={`rounded-lg border-2 border-dashed p-4 min-h-[400px] ${column.color}`}>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.id] || []
          
          return (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${column.headerColor}`}>
                  {column.title}
                </h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <SortableContext
                items={columnTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
                id={`column-${column.id}`}
              >
                <DroppableColumn
                  id={`column-${column.id}`}
                  className={cn(
                    "rounded-lg border-2 border-dashed p-4 min-h-[400px] transition-colors",
                    column.color
                  )}
                >
                  <AnimatePresence>
                    {columnTasks.length === 0 ? (
                      <EmptyState
                        title={`No ${column.title.toLowerCase()} tasks`}
                        description="Drag tasks here or create a new one"
                        className="py-8"
                      />
                    ) : (
                      <div className="space-y-3">
                        {columnTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                          >
                            <SortableTaskItem task={task} onRefetch={onRefetch} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </DroppableColumn>
              </SortableContext>
            </div>
          )
        })}
      </div>

      {/* Drag preview overlay for smoother dragging */}
      <DragOverlay adjustScale={false} dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        {activeId ? (
          (() => {
            const t = currentTasks.find((tk) => tk.id === activeId)
            return t ? (
              <div className="pointer-events-none">
                <TaskCard task={t} onRefetch={() => {}} isDragging />
              </div>
            ) : null
          })()
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
