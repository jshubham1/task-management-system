import{useState, useCallback}from 'react'
import {TaskFilters, TaskStatus, TaskPriority}from '@/types'

export function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    status: undefined,
    priority: undefined,
    projectId: undefined,
    search: undefined
  })

  const updateFilter = useCallback((key: keyof TaskFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const setStatus = useCallback((status: TaskStatus | undefined) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 0 // Reset to first page when filtering
    }))
  }, [])

  const setPriority = useCallback((priority: TaskPriority | undefined) => {
    setFilters(prev => ({
      ...prev,
      priority,
      page: 0 // Reset to first page when filtering
    }))
  }, [])

  const setProject = useCallback((projectId: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      projectId,
      page: 0 // Reset to first page when filtering
    }))
  }, [])

  const setSearch = useCallback((search: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      search,
      page: 0 // Reset to first page when searching
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }, [])

  const setSort = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortDirection,
      page: 0 // Reset to first page when sorting
    }))
  }, [])

  const clearFilter = useCallback((key: keyof TaskFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'page' ? 0 : key === 'size' ? 20 : key === 'sortBy' ? 'createdAt' : key === 'sortDirection' ? 'desc' : undefined,
      page: key !== 'page' ? 0 : prev.page // Reset to first page unless we're clearing the page itself
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 20,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      status: undefined,
      priority: undefined,
      projectId: undefined,
      search: undefined
    })
  }, [])

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.status ||
      filters.priority ||
      filters.projectId ||
      filters.search
)
}, [filters])

return {
filters,
updateFilter,
setStatus,
setPriority,
setProject,
setSearch,
setPage,
setSort,
clearFilter,
resetFilters,
hasActiveFilters: hasActiveFilters()
}
}
