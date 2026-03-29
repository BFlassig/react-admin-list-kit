import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate = false, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    return (
      <input
        ref={(node) => {
          innerRef.current = node

          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
        }}
        type="checkbox"
        className={cn(
          'size-4 rounded border-slate-300 text-blue-700 shadow-sm focus:ring-2 focus:ring-blue-200 focus:ring-offset-0',
          className,
        )}
        {...props}
      />
    )
  },
)

Checkbox.displayName = 'Checkbox'
