/**
 * Privacy sanitization for data sent to session replay and error tracking.
 *
 * Issue #486: LogRocket and Sentry must never receive raw wallet addresses,
 * secret keys, or transaction amounts. See docs/PRIVACY.md for the policy.
 */

const REDACTED = '[REDACTED]'
const REDACTED_AMOUNT = '[AMOUNT]'
const MAX_DEPTH = 8

// Stellar strkey: 'G' + 55 base32 characters for public keys, 'S' for secret seeds.
const PUBLIC_KEY_PATTERN = /\bG[A-Z2-7]{55}\b/g
const SECRET_KEY_PATTERN = /\bS[A-Z2-7]{55}\b/g

const SENSITIVE_KEY_PATTERN = /(secret|private|seed|password|token|authorization|api[-_]?key|cookie)/i
const AMOUNT_KEY_PATTERN = /(amount|balance|price|fee|cost)/i

/**
 * Shortens a Stellar public key to `GABCD…WXYZ` so it stays useful for
 * debugging without identifying the account.
 */
export function redactWalletAddress(address: string): string {
  if (typeof address !== 'string' || address.length < 12) return REDACTED
  return `${address.slice(0, 5)}…${address.slice(-4)}`
}

/**
 * Redacts every Stellar public key and secret seed found inside a string,
 * including URLs such as `/accounts/G...` and JSON response bodies.
 */
export function redactStellarKeysInText(text: string): string {
  return text
    .replace(SECRET_KEY_PATTERN, REDACTED)
    .replace(PUBLIC_KEY_PATTERN, (match) => redactWalletAddress(match))
}

/** True when a URL points at a Stellar network service (Horizon or RPC). */
export function isStellarNetworkUrl(url: string | undefined): boolean {
  return typeof url === 'string' && /\.stellar\.org(\/|$|:)/i.test(url)
}

/**
 * Recursively sanitizes an arbitrary payload:
 * - values under secret-like keys (`token`, `password`, `secret`, ...) are removed
 * - numbers and strings under amount-like keys (`amount`, `balance`, `fee`, ...) are masked
 * - Stellar keys inside any string are redacted
 */
export function sanitizeMonitoringData(value: unknown, key = '', depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[TRUNCATED]'
  if (value === null || value === undefined) return value

  if (SENSITIVE_KEY_PATTERN.test(key)) return REDACTED

  if (AMOUNT_KEY_PATTERN.test(key) && (typeof value === 'number' || typeof value === 'string')) {
    return REDACTED_AMOUNT
  }

  if (typeof value === 'string') return redactStellarKeysInText(value)

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMonitoringData(item, key, depth + 1))
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      sanitized[childKey] = sanitizeMonitoringData(childValue, childKey, depth + 1)
    }
    return sanitized
  }

  return value
}
