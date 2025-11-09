import { memo, forwardRef } from 'react'

/**
 * WorkZen Input Component - Odoo-Inspired Design
 * Clean, accessible input with consistent styling
 * 
 * @example
 * // Basic input
 * <Input
 *   type="text"
 *   placeholder="Enter text"
 *   value={value}
 *   onChange={handleChange}
 * />
 * 
 * @example
 * // Input with label
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 * />
 * 
 * @example
 * // Input with error
 * <Input
 *   label="Username"
 *   type="text"
 *   error="Username is required"
 * />
 * 
 * @example
 * // Input with helper text
 * <Input
 *   label="Password"
 *   type="password"
 *   helperText="Must be at least 8 characters"
 * />
 * 
 * Key Features:
 * - Clean design with proper focus states
 * - Built-in label and error handling
 * - Accessible with proper ARIA attributes
 * - Smooth transitions
 * - Supports all input types
 */
const Input = memo(forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  style = {},
  type = 'text',
  disabled = false,
  required = false,
  fullWidth = true,
  ...props 
}, ref) => {
  const inputStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--font-size-base)',
    lineHeight: 'var(--line-height-normal)',
    color: 'var(--color-text-primary)',
    backgroundColor: disabled ? 'var(--color-secondary)' : 'var(--color-surface)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-base)',
    outline: 'none',
    fontFamily: 'inherit',
    ...style,
  }

  const labelStyles = {
    display: 'block',
    marginBottom: 'var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-primary)',
  }

  const errorStyles = {
    marginTop: 'var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-error)',
  }

  const helperStyles = {
    marginTop: 'var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  }

  const handleFocus = (e) => {
    if (!error) {
      e.target.style.borderColor = 'var(--color-primary)'
      e.target.style.boxShadow = '0 0 0 3px rgba(113, 75, 103, 0.1)'
    }
  }

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        required={required}
        style={inputStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'input-error' : helperText ? 'input-helper' : undefined}
        {...props}
      />
      {error && (
        <div id="input-error" style={errorStyles} role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id="input-helper" style={helperStyles}>
          {helperText}
        </div>
      )}
    </div>
  )
}))

Input.displayName = 'Input'

export default Input
