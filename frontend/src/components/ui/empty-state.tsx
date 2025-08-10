import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      {icon && (
        <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && action}
    </motion.div>
  )
}
