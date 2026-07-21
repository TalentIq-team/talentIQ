import React from 'react'

interface FallbackBadgeProps {
  isFallback: boolean
  className?: string
}

export const FallbackBadge: React.FC<FallbackBadgeProps> = ({ isFallback, className = '' }) => {
  if (!isFallback) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ok/10 text-ok border border-ok/20 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
        Live AI Engine
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-alert/10 text-alert border border-alert/20 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-alert" />
      Rule Heuristic (Fallback)
    </span>
  )
}

export default FallbackBadge
