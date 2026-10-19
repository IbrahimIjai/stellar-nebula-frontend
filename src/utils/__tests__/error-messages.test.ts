import { describe, expect, it } from 'vitest'
import { describeError, toFriendlyError } from '../error-messages'

describe('toFriendlyError', () => {
  it('explains a rejected wallet request', () => {
    const friendly = toFriendlyError(new Error('User rejected the request'))
    expect(friendly.title).toBe('Request cancelled')
  })

  it('explains insufficient balance', () => {
    const friendly = toFriendlyError(new Error('insufficient balance for fee'))
    expect(friendly.title).toBe('Not enough balance')
  })

  it('explains network failures', () => {
    expect(toFriendlyError(new Error('Failed to fetch')).title).toBe('Connection problem')
    expect(toFriendlyError('request timed out').title).toBe('Connection problem')
  })

  it('falls back to a generic message for unknown errors', () => {
    const friendly = toFriendlyError(new Error('xyz unexpected 42'))
    expect(friendly.title).toBe('Something went wrong')
  })

  it('never returns the raw technical text in the friendly message', () => {
    const raw = 'TypeError: Cannot read properties of undefined (reading foo)'
    const friendly = toFriendlyError(new Error(raw))
    expect(friendly.message).not.toContain('TypeError')
    expect(friendly.message).not.toContain(raw)
    expect(friendly.action).not.toContain(raw)
  })

  it('handles non-Error values', () => {
    expect(() => toFriendlyError(undefined)).not.toThrow()
    expect(() => toFriendlyError({ circular: 1 })).not.toThrow()
  })
})

describe('describeError', () => {
  it('returns the message for Error objects', () => {
    expect(describeError(new Error('boom'))).toBe('boom')
  })

  it('returns strings unchanged', () => {
    expect(describeError('plain text')).toBe('plain text')
  })
})
