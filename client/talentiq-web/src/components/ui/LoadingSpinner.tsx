import React from 'react'

interface LoadingSpinnerProps {
  label?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-line/40"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-m2 animate-spin"></div>
      </div>
      {label && <p className="text-sm text-muted font-medium animate-pulse">{label}</p>}
    </div>
  )
}
