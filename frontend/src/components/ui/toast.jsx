import { useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { X, Undo, CheckCircle, AlertCircle, Info } from 'lucide-react'
import Button from './button'

const toastStore = {
  toasts: [],
  listeners: new Set(),
  nextId: 0,

  add(text, type = 'message', preserve = false, action = null, onAction = null, onUndoAction = null) {
    const id = this.nextId++

    const toast = {
      id,
      text,
      type,
      preserve,
      action,
      onAction,
      onUndoAction,
      measuredHeight: null
    }

    if (!preserve) {
      toast.remaining = 4000
      toast.start = Date.now()

      const close = () => {
        this.remove(id)
      }

      toast.timeout = setTimeout(close, toast.remaining)

      toast.pause = () => {
        if (!toast.timeout) return
        clearTimeout(toast.timeout)
        toast.timeout = undefined
        toast.remaining -= Date.now() - toast.start
      }

      toast.resume = () => {
        if (toast.timeout) return
        toast.start = Date.now()
        toast.timeout = setTimeout(close, toast.remaining)
      }
    }

    this.toasts.push(toast)
    this.notify()
  },

  remove(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notify()
  },

  subscribe(listener) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  },

  notify() {
    this.listeners.forEach((fn) => fn())
  }
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])
  const [shownIds, setShownIds] = useState([])
  const [isHovered, setIsHovered] = useState(false)

  const measureRef = (toast) => (node) => {
    if (node && toast.measuredHeight == null) {
      toast.measuredHeight = node.getBoundingClientRect().height
      toastStore.notify()
    }
  }

  useEffect(() => {
    setToasts([...toastStore.toasts])
    return toastStore.subscribe(() => {
      setToasts([...toastStore.toasts])
    })
  }, [])

  useEffect(() => {
    const unseen = toasts.filter(t => !shownIds.includes(t.id)).map(t => t.id)
    if (unseen.length > 0) {
      requestAnimationFrame(() => {
        setShownIds(prev => [...prev, ...unseen])
      })
    }
  }, [toasts])

  const lastVisibleCount = 3
  const lastVisibleStart = Math.max(0, toasts.length - lastVisibleCount)

  const getFinalTransform = (index, length) => {
    if (index === length - 1) {
      return 'none'
    }
    const offset = length - 1 - index
    let translateY = toasts[length - 1]?.measuredHeight || 70
    for (let i = length - 1; i > index; i--) {
      if (isHovered) {
        translateY += (toasts[i - 1]?.measuredHeight || 70) + 12
      } else {
        translateY += 20
      }
    }
    const z = -offset
    const scale = isHovered ? 1 : (1 - 0.05 * offset)
    return `translate3d(0, calc(100% - ${translateY}px), ${z}px) scale(${scale})`
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    toastStore.toasts.forEach((t) => t.pause?.())
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    toastStore.toasts.forEach((t) => t.resume?.())
  }

  const visibleToasts = toasts.slice(lastVisibleStart)
  const containerHeight = visibleToasts.reduce((acc, toast) => {
    return acc + (toast.measuredHeight ?? 70)
  }, 0)

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d97757',
          color: 'var(--color-surface)',
          border: '1px solid #c46847'
        }
      case 'error':
        return {
          backgroundColor: '#dc3545',
          color: 'var(--color-surface)',
          border: '1px solid #c82333'
        }
      case 'warning':
        return {
          backgroundColor: '#ffc107',
          color: 'var(--color-text-primary)',
          border: '1px solid #e0a800'
        }
      default:
        return {
          backgroundColor: '#e3dacc',
          color: 'var(--color-text-primary)',
          border: '1px solid #d1cfc5'
        }
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 shrink-0" />
      case 'error':
        return <AlertCircle className="w-5 h-5 shrink-0" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 shrink-0" />
      default:
        return <Info className="w-5 h-5 shrink-0" />
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none"
      style={{ width: '420px', height: containerHeight }}
    >
      <div
        className="relative pointer-events-auto w-full"
        style={{ height: containerHeight }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {toasts.map((toast, index) => {
          const isVisible = index >= lastVisibleStart
          const toastStyles = getToastStyles(toast.type)

          return (
            <div
              key={toast.id}
              ref={measureRef(toast)}
              className="absolute right-0 bottom-0 shadow-xl rounded-xl p-4 h-fit"
              style={{
                width: '420px',
                ...toastStyles,
                transition: 'all 0.35s cubic-bezier(0.25, 0.75, 0.6, 0.98)',
                transform: shownIds.includes(toast.id)
                  ? getFinalTransform(index, toasts.length)
                  : 'translate3d(0, 100%, 150px) scale(1)',
                opacity: isVisible ? 1 : 0,
                pointerEvents: index < lastVisibleStart ? 'none' : 'auto'
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  {getIcon(toast.type)}
                  <span className="flex-1 text-sm leading-relaxed">{toast.text}</span>
                  {!toast.action && (
                    <div className="flex gap-1 shrink-0">
                      {toast.onUndoAction && (
                        <button
                          onClick={() => {
                            toast.onUndoAction?.()
                            toastStore.remove(toast.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                          style={{ color: toastStyles.color }}
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toastStore.remove(toast.id)}
                        className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                        style={{ color: toastStyles.color }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {toast.action && (
                  <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: `1px solid ${toastStyles.color}20` }}>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => toastStore.remove(toast.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant={toast.type === 'success' ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => {
                        toast.onAction?.()
                        toastStore.remove(toast.id)
                      }}
                    >
                      {toast.action}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

let root = null

const mountContainer = () => {
  if (root) return
  const el = document.createElement('div')
  el.className = 'toast-container'
  document.body.appendChild(el)
  root = createRoot(el)
  root.render(<ToastContainer />)
}

export const useToast = () => {
  return {
    message: useCallback(({ text, preserve, action, onAction, onUndoAction }) => {
      mountContainer()
      toastStore.add(text, 'message', preserve, action, onAction, onUndoAction)
    }, []),
    success: useCallback((text) => {
      mountContainer()
      toastStore.add(text, 'success')
    }, []),
    warning: useCallback((text) => {
      mountContainer()
      toastStore.add(text, 'warning')
    }, []),
    error: useCallback((text) => {
      mountContainer()
      toastStore.add(text, 'error')
    }, [])
  }
}

export const toast = {
  message: (text, options = {}) => {
    mountContainer()
    toastStore.add(text, 'message', options.preserve, options.action, options.onAction, options.onUndoAction)
  },
  success: (text) => {
    mountContainer()
    toastStore.add(text, 'success')
  },
  warning: (text) => {
    mountContainer()
    toastStore.add(text, 'warning')
  },
  error: (text) => {
    mountContainer()
    toastStore.add(text, 'error')
  }
}


