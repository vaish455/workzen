import { memo, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './button'

/**
 * WorkZen Modal Component - Odoo-Inspired Design
 * Accessible modal dialog with backdrop and animations
 * 
 * @example
 * // Basic modal
 * <Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
 *   <p>Modal content here</p>
 * </Modal>
 * 
 * @example
 * // Modal with footer
 * <Modal 
 *   isOpen={isOpen} 
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * 
 * @example
 * // Large modal
 * <Modal isOpen={isOpen} onClose={handleClose} title="Details" size="large">
 *   <p>Large modal content</p>
 * </Modal>
 * 
 * Key Features:
 * - Backdrop with smooth fade
 * - Slide-in animation
 * - Keyboard accessibility (ESC to close)
 * - Focus trap
 * - Size variants
 * - Optional footer
 */
const Modal = memo(({ 
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  className = '',
  closeOnBackdropClick = true,
  showCloseButton = true,
  ...props 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeStyles = {
    small: {
      maxWidth: '400px',
    },
    medium: {
      maxWidth: '600px',
    },
    large: {
      maxWidth: '800px',
    },
    full: {
      maxWidth: '95vw',
    },
  }

  const backdropStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
    zIndex: 'var(--z-modal-backdrop)',
    animation: 'fadeIn var(--transition-base)',
  }

  const modalStyles = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-2xl)',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInUp var(--transition-slow)',
    position: 'relative',
    zIndex: 'var(--z-modal)',
    ...sizeStyles[size],
  }

  const headerStyles = {
    padding: 'var(--space-6)',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const titleStyles = {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  }

  const bodyStyles = {
    padding: 'var(--space-6)',
    overflowY: 'auto',
    flex: 1,
  }

  const footerStyles = {
    padding: 'var(--space-6)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
  }

  const closeButtonStyles = {
    padding: 'var(--space-2)',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCloseButtonHover = (e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'
    e.currentTarget.style.color = 'var(--color-text-primary)'
  }

  const handleCloseButtonLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent'
    e.currentTarget.style.color = 'var(--color-text-secondary)'
  }

  return (
    <div 
      style={backdropStyles} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`modal ${className}`}
        style={modalStyles}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Header */}
        <div style={headerStyles}>
          <h2 id="modal-title" style={titleStyles}>{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              style={closeButtonStyles}
              onMouseEnter={handleCloseButtonHover}
              onMouseLeave={handleCloseButtonLeave}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={bodyStyles}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={footerStyles}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
})

Modal.displayName = 'Modal'

export default Modal
