import React from 'react'

interface EmptyStateProps {
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-line bg-glass/20 rounded-2xl max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-panel flex items-center justify-center text-muted mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 4v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1m16 0H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-head mb-2">{title}</h3>
      <p className="text-sm text-muted mb-6 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-m2 hover:bg-m2/90 text-white transition-all shadow-md shadow-m2/25"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
