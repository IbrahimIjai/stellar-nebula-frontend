import { describe, it, expect } from 'vitest'
import { handleWalletConnectionError, formatWalletError } from '../errorHandling'

describe('handleWalletConnectionError', () => {
  it('classifies a locked wallet with recovery instructions', () => {
    const result = handleWalletConnectionError(new Error('Freighter is locked'), 'freighter')

    expect(result.code).toBe('WALLET_LOCKED')
    expect(result.isRetryable).toBe(true)
    expect(result.helpText).toMatch(/unlock/i)
    expect(formatWalletError(result)).toContain('unlock')
  })

  it('classifies timeouts for any wallet', () => {
    const result = handleWalletConnectionError(new Error('Request timed out'), 'xbull')

    expect(result.code).toBe('REQUEST_TIMEOUT')
    expect(result.isRetryable).toBe(true)
    expect(formatWalletError(result)).toContain('try again')
  })

  it('classifies user rejection with recovery instructions', () => {
    const result = handleWalletConnectionError(new Error('User rejected the request'), 'albedo')

    expect(result.code).toBe('USER_REJECTED')
    expect(result.isRetryable).toBe(true)
    expect(result.helpText).toBeTruthy()
  })

  it('falls back to a retryable unknown error', () => {
    const result = handleWalletConnectionError(new Error('something odd happened'), 'ledger')

    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.message).toBe('something odd happened')
    expect(result.isRetryable).toBe(true)
  })
})
