import{useEffect}from'react'
import {useAuthStore}from '@/stores/auth'

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
    updateUser,
  } = useAuthStore()

  useEffect(() => {
    // Check authentication status on mount
    //checkAuth()
  }, []) // Empty dependency array - only run once on mount

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
    updateUser,
  }
}
