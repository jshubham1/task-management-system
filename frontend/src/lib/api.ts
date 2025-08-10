import {
    UserResponse,
TaskResponse,
TaskStatus,
ProjectResponse,
DashboardSummaryResponse,
TaskStatsResponse,
ProjectStatsResponse,
ActivityResponse,
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
RecentActivityResponse,
MessageResponse,
TaskUpdateRequest,
ProjectUpdateRequest
}from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

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
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
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
        const error = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(error.message || `HTTP ${response.status}`)
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
      const response = await this.request<UserResponse>('/auth/me')
      // The backend returns UserResponse directly, not wrapped in ApiResponse
      return response as unknown as UserResponse
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

      const queryString = params.toString()
      return this.request<TaskListResponse>(`/tasks${queryString ? `?${queryString}` : ''}`)
    },

    getById: async (id: string): Promise<ApiResponse<TaskResponse>> => {
      return this.request<TaskResponse>(`/tasks/${id}`)
    },

    create: async (data: TaskCreateRequest): Promise<ApiResponse<TaskResponse>> => {
      return this.request<TaskResponse>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (id: string, data: TaskUpdateRequest): Promise<ApiResponse<TaskResponse>> => {
      return this.request<TaskResponse>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    delete: async (id: string): Promise<MessageResponse> => {
      return this.requestMessage(`/tasks/${id}`, {
        method: 'DELETE',
      })
    },

    updateStatus: async (id: string, status: TaskStatus): Promise<ApiResponse<TaskResponse>> => {
      return this.request<TaskResponse>(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
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
      return this.request<ProjectResponse>(`/projects/${id}`)
    },

    create: async (data: ProjectCreateRequest): Promise<ApiResponse<ProjectResponse>> => {
      return this.request<ProjectResponse>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (id: string, data: ProjectUpdateRequest): Promise<ApiResponse<ProjectResponse>> => {
      return this.request<ProjectResponse>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    delete: async (id: string): Promise<MessageResponse> => {
      return this.requestMessage(`/projects/${id}`, {
        method: 'DELETE',
      })
    },

    getSummaries: async (): Promise<ApiResponse<ProjectSummaryListResponse>> => {
      return this.request<ProjectSummaryListResponse>('/projects/summaries')
    },

    search: async (query: string): Promise<ApiResponse<ProjectListResponse>> => {
      return this.request<ProjectListResponse>(`/projects/search?q=${encodeURIComponent(query)}`)
    },

    getUpcomingDeadlines: async (days?: number): Promise<ApiResponse<ProjectListResponse>> => {
      const queryString = days ? `?days=${days}` : ''
      return this.request<ProjectListResponse>(`/projects/upcoming-deadlines${queryString}`)
    },
  }
}

export const api = new ApiClient(API_BASE_URL)
