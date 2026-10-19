import { useEffect } from 'react'
import { Button } from './Button'
import { captureError } from '../services/errorTracking'
import { describeError, toFriendlyError } from '../utils/error-messages'

interface ErrorDisplayProps {
  /** The raw error. It is logged for debugging and never shown as-is. */
  error: unknown
  /** Optional retry action. Shows a "Try again" button when provided. */
  onRetry?: () => void
  className?: string
}

/**
 * Shows a friendly, actionable error message. The technical details are
 * logged to error tracking and are only visible in development builds.
 */
export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  const friendly = toFriendlyError(error)

  useEffect(() => {
    captureError(error, {
      source: 'ErrorDisplay',
      friendlyTitle: toFriendlyError(error).title,
    })
  }, [error])

  return (
    <div
      role="alert"
      className={`rounded-xl border border-rose-700 bg-space-900 p-4 text-white ${className}`.trim()}
    >
      <h3 className="font-bold">{friendly.title}</h3>
      <p className="mt-1 text-sm text-space-100">{friendly.message}</p>
      <p className="mt-1 text-sm text-space-100">{friendly.action}</p>

      {onRetry && (
        <Button className="mt-3" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}

      {import.meta.env.DEV && (
        <details className="mt-3 text-xs text-space-100">
          <summary>Technical details (development only)</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">{describeError(error)}</pre>
        </details>
      )}
    </div>
  )
}

export default ErrorDisplay
