import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-head placeholder-muted transition-all duration-200 focus:border-m2 focus:ring-1 focus:ring-m2/30 focus:outline-none ${
              icon ? 'pl-11' : ''
            } ${error ? 'border-alert/50 focus:border-alert focus:ring-alert/30' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-alert font-medium mt-0.5">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
