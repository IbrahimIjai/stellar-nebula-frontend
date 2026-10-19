export type LoadingSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<LoadingSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
}

export interface LoadingProps {
  /** Announced to screen readers. */
  label?: string
  size?: LoadingSize
  className?: string
}

/**
 * Inline spinner for actions and small waits (saving, submitting, reconnecting).
 * Use `LoadingSkeleton` for content areas and `LoadingScreen` for full-page loads.
 */
export function Loading({ label = 'Loading', size = 'md', className = '' }: LoadingProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`inline-block rounded-full border-current border-t-transparent animate-spin ${SIZE_CLASSES[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default Loading
