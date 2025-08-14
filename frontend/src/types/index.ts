// Base types
export type UUID = string

export interface BaseEntity {
  id: UUID
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T = unknown> {
  content: T[]
  pageable: Pageable
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  number: number
  numberOfElements: number
  empty: boolean
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
}

export interface Sort {
  sorted: boolean
  direction: 'ASC' | 'DESC'
  property: string
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface MessageResponse {
  message: string
  success: boolean
  timestamp: string
  code?: string
}

// Enums
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ActivityType =
| 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED'
| 'TASK_STATUS_CHANGED' | 'TASK_PRIORITY_CHANGED' | 'TASK_DUE_DATE_CHANGED'
| 'TASK_ASSIGNED' | 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'PROJECT_COMPLETED'
| 'PROJECT_DELETED' | 'PROJECT_DEADLINE_CHANGED' | 'USER_LOGGED_IN'
| 'USER_PROFILE_UPDATED'

// Auth Models
export interface RegisterRequest {
username: string
email: string
firstName: string
lastName: string
password: string
}

export interface LoginRequest {
email: string
password: string
rememberMe?: boolean
}

export interface RefreshTokenRequest {
refreshToken: string
}

export interface AuthResponse {
message: string
userId: UUID
success: boolean
}

export interface LoginResponse {
accessToken: string
refreshToken: string
tokenType: string
expiresIn: number
user: UserResponse
}

export interface TokenResponse {
accessToken: string
refreshToken: string
tokenType: string
expiresIn: number
refreshExpiresIn: number
}

export interface UserResponse {
id: UUID
username: string
email: string
firstName: string
lastName: string
fullName: string
profilePicture?: string
isActive: boolean
emailVerified: boolean
createdAt: string
lastLoginAt?: string
}

export interface OptionalAuthResponse {
authenticated: boolean
user?: UserResponse
message: string
}

export interface AuthErrorResponse {
authenticated: boolean
error: string
message: string
code: string
timestamp: string
path: string
}

// Task Models
export interface TaskCreateRequest {
title: string
description?: string
priority?: TaskPriority
dueDate?: string
projectId?: UUID
}

export interface TaskUpdateRequest {
title: string
description?: string
status: TaskStatus
priority: TaskPriority
dueDate?: string
projectId?: UUID
}

export interface TaskFilterRequest {
page?: number
size?: number
sortBy?: string
sortDirection?: 'asc' | 'desc'
status?: TaskStatus
priority?: TaskPriority
projectId?: UUID
search?: string
}

export interface TaskResponse extends BaseEntity {
title: string
description?: string
status: TaskStatus
priority: TaskPriority
dueDate?: string
completedAt?: string
projectName?: string
projectId?: UUID
attachments: AttachmentResponse[]
isOverdue: boolean
isDueToday: boolean
}

export interface AttachmentResponse extends BaseEntity {
filename: string
originalFilename: string
mimeType: string
fileSize: number
formattedFileSize: string
fileExtension: string
isImage: boolean
uploadedAt: string
}

export type TaskListResponse = PaginatedResponse<TaskResponse>

// Filters used by UI components
export interface TaskFilters {
page: number
size: number
sortBy: string
sortDirection: 'asc' | 'desc'
status?: TaskStatus
priority?: TaskPriority
// Some UIs allow multi-select of projects; support both
projectId?: UUID | UUID[]
search?: string
dueDate?: {
from?: string
to?: string
}
}

// Project Models
export interface ProjectCreateRequest {
name: string
description?: string
color?: string
deadline?: string
}

export interface ProjectUpdateRequest {
name: string
description?: string
color?: string
deadline?: string
}

export interface ProjectResponse extends BaseEntity {
name: string
description?: string
color: string
deadline?: string
isOverdue?: boolean
}

export interface ProjectSummaryResponse {
id: UUID
name: string
color: string
totalTasks: number
completedTasks: number
overdueTasks: number
progress: number
deadline?: string
isOverdue: boolean
createdAt: string
}

export type ProjectListResponse = ProjectResponse[]
export type ProjectSummaryListResponse = ProjectSummaryResponse[]

// Dashboard Models
export interface DashboardSummaryResponse {
totalTasks: number
completedTasks: number
pendingTasks: number
overdueTasks: number
dueTodayTasks: number
totalProjects: number
projectsWithDeadlines: number
overdueProjects: number
completionRate: number
generatedAt: string
}

export interface TaskStatsResponse {
statusCounts: Record < TaskStatus, number>
priorityCounts: Record< TaskPriority, number>
dailyStats: DailyTaskStats[]
periodDays: number
}

export interface DailyTaskStats {
date: string
created: number
completed: number
totalActive: number
}

export interface ProjectStatsResponse {
totalProjects: number
activeProjects: number
completedProjects: number
overdueProjects: number
projectsWithUpcomingDeadlines: number
averageCompletionRate: number
projectProgress: ProjectProgressStats[]
projectsByMonth: Record < string, number>
generatedAt: string
}

export interface ProjectProgressStats {
projectId: string
projectName: string
projectColor: string
totalTasks: number
completedTasks: number
progressPercentage: number
deadline?: string
}

export interface ActivityResponse {
id: UUID
type: ActivityType
title: string
description: string
entityType: 'TASK' | 'PROJECT' | 'USER'
entityId: UUID
entityName: string
metadata: Record < string, unknown>
timestamp: string
timeAgo: string
icon: string
color: string
}

export type RecentActivityResponse = ActivityResponse[]

// Error Models
export interface ApiError {
status: number
error: string
message: string
path: string
timestamp: string
validationErrors?: ValidationError[]
}

export interface ValidationError {
field: string
message: string
rejectedValue?: unknown
}

export interface BadRequestError extends ApiError {
status: 400
error: 'Bad Request'
}

export interface UnauthorizedError extends ApiError {
status: 401
error: 'Unauthorized'
}

export interface ForbiddenError extends ApiError {
status: 403
error: 'Forbidden'
}

export interface NotFoundError extends ApiError {
status: 404
error: 'Not Found'
}

export interface ConflictError extends ApiError {
status: 409
error: 'Conflict'
}

export interface ValidationApiError extends ApiError {
status: 422
error: 'Validation Failed'
validationErrors: ValidationError[]
}

export interface InternalServerError extends ApiError {
status: 500
error: 'Internal Server Error'
}

// API Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestConfig {
method: HttpMethod
url: string
data?: unknown
params?: Record < string, unknown>
headers?: Record < string, string>
}

export interface ApiResponseType < T = unknown> {
data: T
status: number
statusText: string
headers: Record < string, string>
}

export interface ApiClient {
get: < T = unknown>(url: string, params?: Record<string, unknown>) => Promise<ApiResponseType<T>>
post: < T = unknown>(url: string, data?: unknown) => Promise<ApiResponseType<T>>
put: < T = unknown>(url: string, data?: unknown) => Promise<ApiResponseType<T>>
delete: < T = unknown>(url: string) => Promise<ApiResponseType<T>>
patch: < T = unknown>(url: string, data?: unknown) => Promise<ApiResponseType<T>>
}

// Service Interfaces
export interface AuthService {
register:(data: RegisterRequest) => Promise<ApiResponse<AuthResponse>>
  login: (data: LoginRequest) => Promise<ApiResponse<LoginResponse>>
  refreshToken: (data: RefreshTokenRequest) => Promise<ApiResponse<TokenResponse>>
  logout: () => Promise<MessageResponse>
  getCurrentUser: () => Promise<ApiResponse<UserResponse>>
  getCurrentUserOptional: () => Promise<OptionalAuthResponse>
}

export interface TaskService {
  getAll: (filters?: TaskFilterRequest) => Promise<ApiResponse<TaskListResponse>>
  getById: (id: string) => Promise<ApiResponse<TaskResponse>>
  create: (data: TaskCreateRequest) => Promise<ApiResponse<TaskResponse>>
  update: (id: string, data: TaskUpdateRequest) => Promise<ApiResponse<TaskResponse>>
  delete: (id: string) => Promise<MessageResponse>
}

export interface ProjectService {
  getAll: () => Promise<ApiResponse<ProjectListResponse>>
  getSummaries: () => Promise<ApiResponse<ProjectSummaryListResponse>>
  getById: (id: string) => Promise<ApiResponse<ProjectResponse>>
  create: (data: ProjectCreateRequest) => Promise<ApiResponse<ProjectResponse>>
  update: (id: string, data: ProjectUpdateRequest) => Promise<ApiResponse<ProjectResponse>>
  delete: (id: string) => Promise<MessageResponse>
  search: (query: string) => Promise<ApiResponse<ProjectListResponse>>
  getUpcomingDeadlines: (days?: number) => Promise<ApiResponse<ProjectListResponse>>
}

export interface DashboardService {
  getSummary: () => Promise<ApiResponse<DashboardSummaryResponse>>
  getTaskStats: (params?: { days?: number }) => Promise<ApiResponse<TaskStatsResponse>>
  getProjectStats: () => Promise<ApiResponse<ProjectStatsResponse>>
  getRecentActivity: (params?: { limit?: number }) => Promise<ApiResponse<RecentActivityResponse>>
}

// Hook Types
export interface UseAuthReturn {
  user: UserResponse | null
  loading: boolean
  login: (data: LoginRequest) => Promise<LoginResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<TokenResponse>
  isAuthenticated: boolean
}

// Note: TaskFilters is already defined above with richer fields; keep a single source of truth.

export interface UseTaskFiltersReturn {
  filters: TaskFilters
  updateFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  resetFilters: () => void
  clearFilter: (key: keyof TaskFilters) => void
}

export interface UseLocalStorageReturn<T> {
  value: T | null
  setValue: (value: T) => void
  removeValue: () => void
}

// Legacy type aliases for backward compatibility
export type User = UserResponse
export type Task = TaskResponse
export type Project = ProjectResponse
export type DashboardSummary = DashboardSummaryResponse
export type TaskStats = DailyTaskStats
export type ProjectStats = ProjectProgressStats
export type Activity = ActivityResponse

// Form types (keeping existing for compatibility)
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface CreateTaskForm {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: string
  projectId?: string
}

export interface CreateProjectForm {
  name: string
  description?: string
  color?: string
  deadline?: string
}

// Filter types (keeping existing for compatibility)
export interface ProjectFilters {
  search?: string
}
