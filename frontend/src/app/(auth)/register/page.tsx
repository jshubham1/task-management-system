'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { registerSchema, type RegisterForm } from '@/lib/validations'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      clearError()
      await registerUser(data.username, data.email, data.firstName, data.lastName, data.password)
      toast.success('Account created successfully! Please sign in.')
      router.push('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-white">T</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join TaskFlow and start organizing your work
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...form.register('username')}
                    type="text"
                    placeholder="Choose a username"
                    className={cn(
                      "pl-10",
                      form.formState.errors.username && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    {...form.register('firstName')}
                    type="text"
                    placeholder="First name"
                    className={cn(
                      form.formState.errors.firstName && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    {...form.register('lastName')}
                    type="text"
                    placeholder="Last name"
                    className={cn(
                      form.formState.errors.lastName && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...form.register('email')}
                    type="email"
                    placeholder="Enter your email"
                    className={cn(
                      "pl-10",
                      form.formState.errors.email && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className={cn(
                      "pl-10 pr-10",
                      form.formState.errors.password && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...form.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={cn(
                      "pl-10 pr-10",
                      form.formState.errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
