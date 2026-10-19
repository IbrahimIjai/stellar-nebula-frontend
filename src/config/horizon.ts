/**
 * Horizon connection policy.
 *
 * Issue #488: the app should only talk to the Horizon hosts it intentionally
 * uses, and Horizon requests must never carry cookies or other ambient
 * credentials. CORS itself is enforced by the Horizon server (it answers with
 * `Access-Control-Allow-Origin`), so this module controls which origins the app
 * connects to and makes the credential policy explicit. See docs/API_INTEGRATION.md.
 */

/** Public Horizon hosts for the networks defined in `constants/stellar.ts`. */
export const TRUSTED_HORIZON_HOSTS: readonly string[] = [
  'horizon-testnet.stellar.org',
  'horizon-futurenet.stellar.org',
  'horizon.stellar.org',
]

/** Hosts that a local Stellar Quickstart node uses. Only allowed in development. */
const LOCAL_HORIZON_HOSTS: readonly string[] = ['localhost', '127.0.0.1']

/**
 * Horizon is a public, read-only API for this app. `omit` ensures browser
 * cookies and HTTP auth are never attached to cross-origin Horizon requests.
 */
export const HORIZON_FETCH_CREDENTIALS: RequestCredentials = 'omit'

export interface HorizonUrlPolicy {
  /** Accept `http://localhost` and `http://127.0.0.1` (local Quickstart). */
  allowLocal?: boolean
}

/**
 * Returns true when `url` is an HTTPS Horizon endpoint on the trusted host list.
 * URLs with embedded credentials are rejected, and so are URLs on other hosts.
 */
export function isTrustedHorizonUrl(url: string, policy: HorizonUrlPolicy = {}): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  if (parsed.username || parsed.password) return false

  if (parsed.protocol === 'https:') {
    return TRUSTED_HORIZON_HOSTS.includes(parsed.hostname)
  }

  if (policy.allowLocal && parsed.protocol === 'http:') {
    return LOCAL_HORIZON_HOSTS.includes(parsed.hostname)
  }

  return false
}

/**
 * Throws when a Horizon URL is not allowed by policy.
 * Call it before creating a Horizon client so a bad URL fails early.
 */
export function assertTrustedHorizonUrl(url: string, policy: HorizonUrlPolicy = {}): string {
  if (!isTrustedHorizonUrl(url, policy)) {
    throw new Error(
      `Refusing to connect to untrusted Horizon URL "${url}". Allowed hosts: ${TRUSTED_HORIZON_HOSTS.join(', ')}.`
    )
  }
  return url
}
