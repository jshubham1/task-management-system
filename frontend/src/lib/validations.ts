import{z}from'zod'

// Auth validation schemas
export const loginSchema = z.object({
email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
})

export const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional()
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().optional(),
  projectId: z.string().optional()
})

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  deadline: z.string().optional()
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  deadline: z.string().optional()
})

// Filter validation schemas
export const taskFiltersSchema = z.object({
  page: z.number().min(0).optional(),
  size: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  projectId: z.string().optional(),
  search: z.string().optional()
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type CreateTaskForm = z.infer<typeof createTaskSchema>
export type UpdateTaskForm = z.infer<typeof updateTaskSchema>
export type CreateProjectForm = z.infer<typeof createProjectSchema>
export type UpdateProjectForm = z.infer<typeof updateProjectSchema>
export type TaskFiltersForm = z.infer<typeof taskFiltersSchema>
