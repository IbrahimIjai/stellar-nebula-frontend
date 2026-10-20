import { describe, it, expect, vi, afterEach } from 'vitest'
import { withTimeout, SIGNING_TIMEOUT_MS, SIGNING_TIMEOUT_MESSAGE } from '../timeout'

afterEach(() => {
  vi.useRealTimers()
})

describe('withTimeout', () => {
  it('uses a 60 second default for signing requests', () => {
    expect(SIGNING_TIMEOUT_MS).toBe(60_000)
  })

  it('resolves with the promise value when it settles in time', async () => {
    await expect(withTimeout(Promise.resolve('signed-xdr'), 1000, 'timed out')).resolves.toBe(
      'signed-xdr'
    )
  })

  it('rejects with the timeout message when the promise hangs', async () => {
    vi.useFakeTimers()

    const hanging = new Promise<string>(() => {})
    const assertion = expect(
      withTimeout(hanging, SIGNING_TIMEOUT_MS, SIGNING_TIMEOUT_MESSAGE)
    ).rejects.toThrow(SIGNING_TIMEOUT_MESSAGE)

    await vi.advanceTimersByTimeAsync(SIGNING_TIMEOUT_MS)
    await assertion
  })

  it('rejects with the original error when the promise fails first', async () => {
    const failure = Promise.reject(new Error('user rejected in wallet'))

    await expect(withTimeout(failure, 1000, 'timed out')).rejects.toThrow('user rejected in wallet')
  })
})
