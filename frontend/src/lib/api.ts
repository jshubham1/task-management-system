import {
    UserResponse,
    TaskResponse,
    TaskStatus,
    ProjectResponse,
    DashboardSummaryResponse,
    TaskStatsResponse,
    ProjectStatsResponse,
    TaskFilterRequest,
    ProjectFilters,
    LoginRequest,
    RegisterRequest,
    TaskCreateRequest,
    ProjectCreateRequest,
    ApiResponse,
    LoginResponse,
    AuthResponse,
    TaskListResponse,
    ProjectListResponse,
    ProjectSummaryListResponse,
    ProjectSummaryResponse,
    RecentActivityResponse,
    MessageResponse,
    TaskUpdateRequest,
    ProjectUpdateRequest
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

function extractMessage(body: unknown): string | undefined {
  if (typeof body === 'object' && body !== null) {
    const rec = body as Record<string, unknown>
    const msg = rec.message
    if (typeof msg === 'string') return msg
  }
  return undefined
}

// Exported error type so UI can distinguish and read server-provided details
export class HttpError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message?: string) {
    const derived = message || extractMessage(body) || `HTTP ${status}`
    super(derived)
    this.name = 'HttpError'
    this.status = status
    this.body = body
  }
}

class ApiClient {
private baseURL: string
private token: string | null = null

constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let parsed: unknown = null
      try {
        parsed = await response.json()
      } catch {
        try {
          const text = await response.text()
          parsed = text
        } catch {
          parsed = null
        }
      }
      throw new HttpError(response.status, parsed)
    }

    return response.json()
  }

  private async requestMessage(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MessageResponse> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Authentication endpoints
  auth = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      const url = `${this.baseURL}/auth/login`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let parsed: unknown = null
        try {
          parsed = await response.json()
        } catch {
          try {
            parsed = await response.text()
          } catch {
            parsed = null
          }
        }
        throw new HttpError(response.status, parsed)
      }

      const loginResponse: LoginResponse = await response.json()
      if (loginResponse.accessToken) {
        this.setToken(loginResponse.accessToken)
      }
      return loginResponse
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    },

    logout: async (): Promise<MessageResponse> => {
      const response = await this.requestMessage('/auth/logout', {
        method: 'POST',
      })
      this.clearToken()
      return response
    },

    me: async (): Promise<UserResponse> => {
      // Backend returns raw UserResponse at GET /auth/me (no ApiResponse wrapper)
      const url = `${this.baseURL}/auth/me`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'GET', headers })
      if (!res.ok) {
        let parsed: unknown = null
        try {
          parsed = await res.json()
        } catch {
          try {
            parsed = await res.text()
          } catch {
            parsed = null
          }
        }
        throw new HttpError(res.status, parsed)
      }
      return res.json()
    },
  }

  // Dashboard endpoints
  dashboard = {
    getSummary: async (): Promise<DashboardSummaryResponse> => {
      const url = `${this.baseURL}/dashboard/summary`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return response.json()
    },

    getTaskStats: async (params?: { days?: number }): Promise<TaskStatsResponse> => {
      const queryString = params?.days ? `?days=${params.days}` : ''
      const url = `${this.baseURL}/dashboard/task-stats${queryString}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return response.json()
    },

    getProjectStats: async (): Promise<ProjectStatsResponse> => {
      const url = `${this.baseURL}/dashboard/project-stats`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return response.json()
    },

    getRecentActivity: async (params?: { limit?: number }): Promise<RecentActivityResponse> => {
      const queryString = params?.limit ? `?limit=${params.limit}` : ''
      const url = `${this.baseURL}/dashboard/recent-activity${queryString}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return response.json()
    },
  }
  
  // User endpoints
  users = {
    getAll: async (): Promise<ApiResponse<UserResponse[]>> => {
      return this.request<UserResponse[]>('/users')
    },
    updateProfile: async (data: { fullName?: string; email?: string; profilePicture?: string }): Promise<ApiResponse<UserResponse>> => {
      return this.request<UserResponse>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
  }

  // Task endpoints
  tasks = {
    getAll: async (filters?: TaskFilterRequest): Promise<ApiResponse<TaskListResponse>> => {
      const params = new URLSearchParams()
      if (filters?.page !== undefined) params.append('page', filters.page.toString())
      if (filters?.size !== undefined) params.append('size', filters.size.toString())
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.projectId) params.append('projectId', filters.projectId)
      if (filters?.search) params.append('search', filters.search)

      const url = `${this.baseURL}/tasks${params.toString() ? `?${params.toString()}` : ''}`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'GET', headers })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const page = await res.json()
      return { data: page, success: true, message: 'OK', timestamp: new Date().toISOString() }
    },

    getById: async (id: string): Promise<ApiResponse<TaskResponse>> => {
      const url = `${this.baseURL}/tasks/${id}`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'GET', headers })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const task: TaskResponse = await res.json()
      return { data: task, success: true, message: 'OK', timestamp: new Date().toISOString() }
    },

    create: async (data: TaskCreateRequest): Promise<ApiResponse<TaskResponse>> => {
      // Normalize dueDate to yyyy-MM-dd if provided
      const normalized: TaskCreateRequest = {
        ...data,
        dueDate: data.dueDate
          ? (data.dueDate.includes('T') ? data.dueDate.split('T')[0] : data.dueDate)
          : undefined,
      }
      const url = `${this.baseURL}/tasks`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(normalized) })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const task: TaskResponse = await res.json()
      return { data: task, success: true, message: 'Created', timestamp: new Date().toISOString() }
    },

    update: async (id: string, data: TaskUpdateRequest): Promise<ApiResponse<TaskResponse>> => {
      // Normalize dueDate to yyyy-MM-dd if provided
      const normalized: TaskUpdateRequest = {
        ...data,
        dueDate: data.dueDate
          ? (data.dueDate.includes('T') ? data.dueDate.split('T')[0] : data.dueDate)
          : undefined,
      }
      const url = `${this.baseURL}/tasks/${id}`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(normalized) })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const task: TaskResponse = await res.json()
      return { data: task, success: true, message: 'OK', timestamp: new Date().toISOString() }
    },

    delete: async (id: string): Promise<MessageResponse> => {
      return this.requestMessage(`/tasks/${id}`, {
        method: 'DELETE',
      })
    },

    updateStatus: async (id: string, status: TaskStatus): Promise<ApiResponse<TaskResponse>> => {
      // Fetch current task using wrapped getById to ensure consistent shape
      const current = await this.tasks.getById(id)
      // Normalize dueDate to date-only string to satisfy backend LocalDate (yyyy-MM-dd)
      const dueDateDateOnly = current.data.dueDate
        ? (current.data.dueDate.includes('T')
            ? current.data.dueDate.split('T')[0]
            : current.data.dueDate)
        : undefined

      const body: TaskUpdateRequest = {
        title: current.data.title,
        description: current.data.description ?? undefined,
        status,
        priority: current.data.priority,
        dueDate: dueDateDateOnly,
        projectId: current.data.projectId ?? undefined,
      }

      const url = `${this.baseURL}/tasks/${id}`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const task: TaskResponse = await res.json()
      return { data: task, success: true, message: 'OK', timestamp: new Date().toISOString() }
    },

    }

  // Project endpoints
  projects = {
    getAll: async (filters?: ProjectFilters): Promise<ApiResponse<ProjectListResponse>> => {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)

      const queryString = params.toString()
      // Backend returns a raw list (ProjectResponse[]), not wrapped in ApiResponse
      const url = `${this.baseURL}/projects${queryString ? `?${queryString}` : ''}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }
      const response = await fetch(url, { method: 'GET', headers })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }
      const list: ProjectListResponse = await response.json()
      return {
        data: list,
        success: true,
        message: 'OK',
        timestamp: new Date().toISOString(),
      }
    },

    getById: async (id: string): Promise<ApiResponse<ProjectResponse>> => {
      const url = `${this.baseURL}/projects/${id}`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'GET', headers })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const project: ProjectResponse = await res.json()
      return { data: project, success: true, message: 'OK', timestamp: new Date().toISOString() }
    },

    create: async (data: ProjectCreateRequest): Promise<ApiResponse<ProjectResponse>> => {
      const url = `${this.baseURL}/projects`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const project: ProjectResponse = await res.json()
      return { data: project, success: true, message: 'Created', timestamp: new Date().toISOString() }
    },

    update: async (id: string, data: ProjectUpdateRequest): Promise<ApiResponse<ProjectResponse>> => {
      const url = `${this.baseURL}/projects/${id}`
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.token) headers.Authorization = `Bearer ${this.token}`
      const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${res.status}`)
      }
      const project: ProjectResponse = await res.json()
      return { data: project, success: true, message: 'OK', timestamp: new Date().toISOString() }
    },

    delete: async (id: string): Promise<MessageResponse> => {
      return this.requestMessage(`/projects/${id}`, {
        method: 'DELETE',
      })
    },

    getSummaries: async (): Promise<ApiResponse<ProjectSummaryListResponse>> => {
      // Try /projects/summary first; some backends may return raw list or use /projects/summaries
      const tryFetch = async (path: string): Promise<ApiResponse<ProjectSummaryListResponse>> => {
        const url = `${this.baseURL}${path}`
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (this.token) headers.Authorization = `Bearer ${this.token}`
        const res = await fetch(url, { method: 'GET', headers })
        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: 'Network error' }))
          throw new Error(error.message || `HTTP ${res.status}`)
        }
        const json = await res.json()

        type AnyProjectSummary = {
          id?: string
          projectId?: string
          name?: string
          projectName?: string
          color?: string
          projectColor?: string
          totalTasks?: number
          taskCount?: number
          tasks?: number
          completedTasks?: number
          doneTasks?: number
          completed?: number
          overdueTasks?: number
          progressPercentage?: number
          progress?: number
          deadline?: string
          isOverdue?: boolean
          createdAt?: string
        }

        const normalize = (s: AnyProjectSummary): ProjectSummaryResponse => {
          const progressRaw = s.progressPercentage ?? s.progress ?? 0
          const progress = progressRaw > 1 ? progressRaw : progressRaw * 100
          return {
            id: (s.id ?? s.projectId ?? '') as string,
            name: s.name ?? s.projectName ?? 'Untitled',
            color: s.color ?? s.projectColor ?? '#3b82f6',
            totalTasks: s.totalTasks ?? s.taskCount ?? s.tasks ?? 0,
            completedTasks: s.completedTasks ?? s.doneTasks ?? s.completed ?? 0,
            overdueTasks: s.overdueTasks ?? 0,
            progress,
            deadline: s.deadline,
            isOverdue: Boolean(s.isOverdue),
            createdAt: s.createdAt ?? new Date().toISOString(),
          }
        }

        if (Array.isArray(json)) {
          // Raw list
          const mapped = (json as AnyProjectSummary[]).map(normalize)
          return { data: mapped as ProjectSummaryListResponse, success: true, message: 'OK', timestamp: new Date().toISOString() }
        }
        // Assume ApiResponse shape (data can be array or object with list)
        const wrapped = json as ApiResponse<unknown>
        const arrayData = Array.isArray(wrapped.data) ? (wrapped.data as unknown[]) : []
        const data = (arrayData as AnyProjectSummary[]).map(normalize)
        return { data, success: true, message: 'OK', timestamp: new Date().toISOString() }
      }

      try {
        return await tryFetch('/projects/summary')
      } catch {
        // Fallback path
        return await tryFetch('/projects/summaries')
      }
    },

    search: async (query: string): Promise<ApiResponse<ProjectListResponse>> => {
      // Backend expects parameter name 'query'
      return this.request<ProjectListResponse>(`/projects/search?query=${encodeURIComponent(query)}`)
    },

    getUpcomingDeadlines: async (days?: number): Promise<ApiResponse<ProjectListResponse>> => {
      const queryString = days ? `?days=${days}` : ''
      return this.request<ProjectListResponse>(`/projects/upcoming-deadlines${queryString}`)
    },
  }
}

export const api = new ApiClient(API_BASE_URL)
