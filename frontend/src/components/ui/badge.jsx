import { memo } from 'react'

/**
 * WorkZen Badge Component - Odoo-Inspired Design
 * Status indicators and labels with pastel accent colors
 * 
 * @example
 * // Success badge
 * <Badge variant="success">Active</Badge>
 * 
 * @example
 * // Warning badge
 * <Badge variant="warning">Pending</Badge>
 * 
 * @example
 * // Error badge
 * <Badge variant="error">Rejected</Badge>
 * 
 * @example
 * // Info badge
 * <Badge variant="info">Draft</Badge>
 * 
 * @example
 * // Custom color badge
 * <Badge variant="pink">Featured</Badge>
 * 
 * Key Features:
 * - Semantic color variants
 * - Pastel accent colors for aesthetic appeal
 * - Small and medium sizes
 * - Clean, rounded design
 * - Accessible with proper contrast
 */
const Badge = memo(({ 
  children, 
  variant = 'default',
  size = 'medium',
  className = '',
  style = {},
  ...props 
}) => {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-text-secondary)',
    },
    success: {
      backgroundColor: 'var(--color-success-light)',
      color: 'var(--color-success)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-light)',
      color: '#D97706',
    },
    error: {
      backgroundColor: 'var(--color-error-light)',
      color: 'var(--color-error)',
    },
    info: {
      backgroundColor: 'var(--color-info-light)',
      color: 'var(--color-info)',
    },
    pink: {
      backgroundColor: 'var(--color-accent-pink)',
      color: '#BE185D',
    },
    lavender: {
      backgroundColor: 'var(--color-accent-lavender)',
      color: '#7C3AED',
    },
    mint: {
      backgroundColor: 'var(--color-accent-mint)',
      color: '#047857',
    },
    peach: {
      backgroundColor: 'var(--color-accent-peach)',
      color: '#C2410C',
    },
    sky: {
      backgroundColor: 'var(--color-accent-sky)',
      color: '#0369A1',
    },
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-surface)',
    },
  }

  const sizeStyles = {
    small: {
      padding: 'var(--space-1) var(--space-2)',
      fontSize: 'var(--font-size-xs)',
      lineHeight: 'var(--line-height-tight)',
    },
    medium: {
      padding: 'var(--space-1) var(--space-3)',
      fontSize: 'var(--font-size-sm)',
      lineHeight: 'var(--line-height-tight)',
    },
  }

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: 'var(--radius-full)',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  }

  return (
    <span className={`badge ${className}`} style={baseStyles} {...props}>
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge
