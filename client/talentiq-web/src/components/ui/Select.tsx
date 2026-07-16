import React, { forwardRef } from 'react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-head transition-all duration-200 focus:border-m2 focus:ring-1 focus:ring-m2/30 focus:outline-none cursor-pointer appearance-none ${
            error ? 'border-alert/50 focus:border-alert focus:ring-alert/30' : ''
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-panel text-head">
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-alert font-medium mt-0.5">{error}</span>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
