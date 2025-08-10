'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  UserIcon, 
  EnvelopeIcon, 
  CameraIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      const response = await api.users.updateProfile(data)
      updateUser(response.data)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your account information and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {avatarPreview || user.avatar ? (
                      <img
                        className="h-20 w-20 rounded-full object-cover"
                        src={avatarPreview || user.avatar}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <CameraIcon className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">Click the camera icon to update your photo</p>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...form.register('name')}
                      placeholder="Enter your full name"
                      className={cn(
                        "pl-10",
                        form.formState.errors.name && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...form.register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className={cn(
                        "pl-10",
                        form.formState.errors.email && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast('Password change coming soon')}
              >
                Change Password
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast('Export data coming soon')}
              >
                Export Data
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => toast('Account deletion coming soon')}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
