import { memo } from 'react'

/**
 * WorkZen Button Component - Odoo-Inspired Design
 * Clean, minimal design with sophisticated hover states and smooth transitions
 * 
 * @example
 * // Primary button (default)
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * @example
 * // Secondary button with icon
 * <Button variant="secondary" icon={Plus} iconPosition="left">
 *   Add Item
 * </Button>
 * 
 * @example
 * // Ghost button (transparent)
 * <Button variant="ghost" size="small">
 *   Cancel
 * </Button>
 * 
 * @example
 * // Disabled button
 * <Button variant="primary" disabled>
 *   Processing...
 * </Button>
 * 
 * @example
 * // Full width button
 * <Button variant="primary" fullWidth>
 *   Submit Form
 * </Button>
 * 
 * Key Features:
 * - Smooth transitions using design system tokens
 * - Subtle hover effects with proper visual feedback
 * - Accessible with proper disabled states
 * - Clean typography with design system fonts
 * - Professional, minimal design
 */
const Button = memo(({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
  }

  const sizeStyles = {
    small: {
      padding: 'var(--space-2) var(--space-4)',
      fontSize: 'var(--font-size-sm)',
      lineHeight: 'var(--line-height-tight)',
    },
    medium: {
      padding: 'var(--space-3) var(--space-5)',
      fontSize: 'var(--font-size-base)',
      lineHeight: 'var(--line-height-normal)',
    },
    large: {
      padding: 'var(--space-4) var(--space-6)',
      fontSize: 'var(--font-size-lg)',
      lineHeight: 'var(--line-height-normal)',
    },
  }

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-surface)',
      borderColor: 'var(--color-primary)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      borderColor: 'var(--color-border)',
    },
    tertiary: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      borderColor: 'var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-surface)',
      borderColor: 'var(--color-error)',
    },
    success: {
      backgroundColor: 'var(--color-success)',
      color: 'var(--color-surface)',
      borderColor: 'var(--color-success)',
    },
  }

  const disabledStyles = {
    opacity: 0.5,
    cursor: 'not-allowed',
  }

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(disabled && disabledStyles),
  }

  const handleMouseEnter = (e) => {
    if (disabled) return
    
    switch (variant) {
      case 'primary':
        e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        break
      case 'secondary':
        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'
        e.currentTarget.style.borderColor = 'var(--color-primary)'
        break
      case 'tertiary':
        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'
        break
      case 'ghost':
        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'
        break
      case 'danger':
        e.currentTarget.style.backgroundColor = '#DC2626'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        break
      case 'success':
        e.currentTarget.style.backgroundColor = '#059669'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        break
      default:
        break
    }
  }

  const handleMouseLeave = (e) => {
    if (disabled) return
    
    e.currentTarget.style.backgroundColor = variantStyles[variant].backgroundColor
    e.currentTarget.style.borderColor = variantStyles[variant].borderColor
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }

  const handleMouseDown = (e) => {
    if (disabled) return
    e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
  }

  const handleMouseUp = (e) => {
    if (disabled) return
    e.currentTarget.style.transform = 'translateY(-1px) scale(1)'
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      style={combinedStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" style={{ flexShrink: 0 }} />
      )}
      <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" style={{ flexShrink: 0 }} />
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button

