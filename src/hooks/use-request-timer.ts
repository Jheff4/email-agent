import { useState, useEffect } from 'react'

const TIME_LIMIT_MINUTES = 24

interface UseRequestTimerReturn {
  remainingSeconds: number
  isOverdue: boolean
  formatDuration: (seconds: number) => string
}

export function useRequestTimer(createdAt: string | Date): UseRequestTimerReturn {
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!createdAt) return { remainingSeconds: 0, isOverdue: true }
    
    const createdTime = new Date(createdAt).getTime()
    const timeLimitMs = TIME_LIMIT_MINUTES * 60 * 60 * 1000 // 24 hours in milliseconds
    const deadlineTime = createdTime + timeLimitMs
    const remainingMs = deadlineTime - currentTime
    
    const isOverdue = remainingMs <= 0
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000))
    
    return { remainingSeconds, isOverdue }
  }

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const { remainingSeconds, isOverdue } = getRemainingTime()

  return {
    remainingSeconds,
    isOverdue,
    formatDuration
  }
}