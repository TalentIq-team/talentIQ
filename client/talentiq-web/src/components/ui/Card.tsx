import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'glass' | 'borderless'
  hoverEffect?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'solid',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-2xl transition-all duration-300 overflow-hidden'
  
  const variants = {
    solid: 'bg-panel border border-line',
    glass: 'bg-glass border border-line',
    borderless: 'bg-panel-2',
  }

  const hoverStyle = hoverEffect
    ? 'hover:-translate-y-1 hover:border-m2/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
    : ''

  return (
    <div className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
