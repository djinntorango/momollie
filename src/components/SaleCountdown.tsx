import { useEffect, useRef, useState } from 'react'

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Sale ended'
  const totalSecs = Math.floor(ms / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60

  if (days > 0) return `Sale ends in ${days}d ${hours}h`
  if (hours > 0) return `Sale ends in ${hours}h ${mins}m`
  if (mins > 0) return `Sale ends in ${mins}m ${secs}s`
  return `Sale ends in ${secs}s`
}

interface SaleCountdownProps {
  endsAt: Date
  className?: string
  onExpire?: () => void
}

export default function SaleCountdown({ endsAt, className = '', onExpire }: SaleCountdownProps) {
  const [msLeft, setMsLeft] = useState(() => endsAt.getTime() - Date.now())
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    const idRef = { current: undefined as ReturnType<typeof setInterval> | undefined }
    const tick = () => {
      const ms = endsAt.getTime() - Date.now()
      setMsLeft(ms)
      if (ms <= 0) {
        clearInterval(idRef.current)
        onExpireRef.current?.()
      }
    }
    tick()
    idRef.current = setInterval(tick, 1000)
    return () => clearInterval(idRef.current)
  }, [endsAt])

  if (msLeft <= 0) return null

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {formatTimeLeft(msLeft)}
    </span>
  )
}
