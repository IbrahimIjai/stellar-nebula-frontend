export interface LoadingSkeletonProps {
  /** Number of placeholder lines to draw. */
  lines?: number
  /** Announced to screen readers while content loads. */
  label?: string
  className?: string
}

/**
 * Placeholder shape for content that is loading (text, lists, cards).
 * The shapes are hidden from assistive tech; the label is announced once.
 */
export function LoadingSkeleton({
  lines = 3,
  label = 'Loading content',
  className = '',
}: LoadingSkeletonProps) {
  const count = Math.max(1, Math.floor(lines))

  return (
    <div role="status" aria-busy="true" className={`space-y-3 ${className}`.trim()}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`h-4 animate-pulse rounded bg-space-800 ${
            index === count - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

export default LoadingSkeleton
