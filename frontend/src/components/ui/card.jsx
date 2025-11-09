import { memo } from 'react'

/**
 * WorkZen Card Component - Odoo-Inspired Design
 * Flexible card container with clean shadows and borders
 * 
 * @example
 * // Basic card
 * <Card>
 *   <p>Card content here</p>
 * </Card>
 * 
 * @example
 * // Card with header
 * <Card>
 *   <Card.Header>
 *     <h3>Card Title</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Card content here</p>
 *   </Card.Body>
 * </Card>
 * 
 * @example
 * // Card with footer
 * <Card>
 *   <Card.Body>
 *     <p>Card content here</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Action</Button>
 *   </Card.Footer>
 * </Card>
 * 
 * @example
 * // Hoverable card
 * <Card hoverable onClick={handleClick}>
 *   <p>Clickable card</p>
 * </Card>
 * 
 * Key Features:
 * - Clean shadows using design system
 * - Proper padding and spacing
 * - Optional hover effects
 * - Modular header, body, footer sections
 * - Responsive and accessible
 */
const Card = memo(({ 
  children, 
  className = '',
  hoverable = false,
  onClick,
  style = {},
  ...props 
}) => {
  const baseStyles = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-base)',
    cursor: onClick || hoverable ? 'pointer' : 'default',
    ...style,
  }

  const handleMouseEnter = (e) => {
    if (hoverable || onClick) {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }
  }

  const handleMouseLeave = (e) => {
    if (hoverable || onClick) {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      e.currentTarget.style.transform = 'translateY(0)'
    }
  }

  return (
    <div
      className={`card ${className}`}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card Header Component
const CardHeader = memo(({ children, className = '', style = {}, ...props }) => {
  const headerStyles = {
    padding: 'var(--space-6)',
    borderBottom: '1px solid var(--color-border)',
    ...style,
  }

  return (
    <div className={`card-header ${className}`} style={headerStyles} {...props}>
      {children}
    </div>
  )
})

CardHeader.displayName = 'Card.Header'

// Card Body Component
const CardBody = memo(({ children, className = '', style = {}, ...props }) => {
  const bodyStyles = {
    padding: 'var(--space-6)',
    ...style,
  }

  return (
    <div className={`card-body ${className}`} style={bodyStyles} {...props}>
      {children}
    </div>
  )
})

CardBody.displayName = 'Card.Body'

// Card Footer Component
const CardFooter = memo(({ children, className = '', style = {}, ...props }) => {
  const footerStyles = {
    padding: 'var(--space-6)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    ...style,
  }

  return (
    <div className={`card-footer ${className}`} style={footerStyles} {...props}>
      {children}
    </div>
  )
})

CardFooter.displayName = 'Card.Footer'

// Attach sub-components to Card
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
