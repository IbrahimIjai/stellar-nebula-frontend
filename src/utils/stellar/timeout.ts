/**
 * Maximum time to wait for a wallet signature before failing with a
 * clear, retryable error instead of hanging forever.
 */
export const SIGNING_TIMEOUT_MS = 60_000

export const SIGNING_TIMEOUT_MESSAGE =
  'Signature request timed out after 60 seconds. Approve the request in your wallet, then try again.'

/**
 * Rejects with `message` if `promise` does not settle within `timeoutMs`.
 *
 * The underlying wallet request cannot be cancelled, but the UI is freed
 * and the user gets actionable feedback instead of an indefinite wait.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
