import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { FpsCounter } from '../FpsCounter'

describe('FpsCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an initial FPS value', () => {
    render(<FpsCounter />)
    expect(screen.getByText(/fps/i)).toBeInTheDocument()
  })

  it('displays FPS as a number followed by FPS label', () => {
    render(<FpsCounter />)
    const el = screen.getByText(/fps/i)
    expect(el.textContent).toMatch(/\d+ FPS/)
  })
})
