import React from 'react'
import './AiPanels.css'

interface FallbackBadgeProps {
  isFallback: boolean
  className?: string
}

export const FallbackBadge: React.FC<FallbackBadgeProps> = ({ isFallback, className = '' }) => {
  if (!isFallback) {
    return (
      <span className={`ai-badge-gemini ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
        </svg>
        Gemini Analyzed
      </span>
    )
  }

  return (
    <span className={`ai-badge-fallback ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
      IsFallbackExecution = true
    </span>
  )
}

export default FallbackBadge
