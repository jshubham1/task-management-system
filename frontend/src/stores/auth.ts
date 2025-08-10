import{create}from'zustand'
import {persist}from 'zustand/middleware'
import {UserResponse, LoginRequest, RegisterRequest} from '@/types'
import {api} from '@/lib/api'

interface AuthState {
user: UserResponse | null
isAuthenticated: boolean
isLoading: boolean
error: string | null
}

interface AuthActions {
login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (username: string, email: string, firstName: string, lastName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  updateUser: (user: Partial<UserResponse>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to prevent premature redirects
      error: null,

      // Actions
      login: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null })
        try {
          const loginData: LoginRequest = { email, password, rememberMe }
          const response = await api.auth.login(loginData)
          console.log('Login response:', response)
          console.log('Setting auth state with user:', response.user)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          console.log('Auth state after login:', get())
        } catch (error) {
          console.error('Login error:', error)
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (username: string, email: string, firstName: string, lastName: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const registerData: RegisterRequest = { 
            username, 
            email, 
            firstName,
            lastName,
            password
          }
          const response = await api.auth.register(registerData)
          // Note: Register response doesn't include user data, need to fetch it separately
          if (response.success) {
            // After successful registration, we might need to login or fetch user data
            set({
              user: null, // Will be set after login
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.auth.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const response = await api.auth.me()
          set({
            user: response,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (userData: Partial<UserResponse>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user data, derive isAuthenticated from user existence
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if we have both user and token
        if (state) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
          const hasUser = !!state.user
          const hasToken = !!token
          
          console.log('Auth rehydration - User:', hasUser, 'Token:', hasToken)
          
          // Only set authenticated if we have both user and token
          if (hasUser && hasToken) {
            state.isAuthenticated = true
            state.isLoading = false
          } else {
            // Clear inconsistent state
            state.user = null
            state.isAuthenticated = false
            state.isLoading = false
            if (typeof window !== 'undefined' && !hasToken) {
              localStorage.removeItem('auth_token')
            }
          }
        }
      },
    }
)
)
