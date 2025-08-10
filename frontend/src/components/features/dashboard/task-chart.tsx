'use client'

import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskStats } from '@/types'
import { formatDate } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TaskChartProps {
  data?: TaskStats[]
  loading?: boolean
}

export function TaskChart({ data, loading }: TaskChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    const labels = data.map(item => formatDate(item.date))
    
    return {
      labels,
      datasets: [
        {
          label: 'Tasks Completed',
          data: data.map(item => item.completed),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Tasks Created',
          data: data.map(item => item.created),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Activity</CardTitle>
        <p className="text-sm text-gray-600">
          Track your task completion and creation over the last 30 days
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data && data.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">Start creating tasks to see your activity</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
