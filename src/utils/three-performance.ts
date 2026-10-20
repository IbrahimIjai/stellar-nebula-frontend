/**
 * Three.js Performance & Optimization Utilities (#351)
 *
 * Provides device detection, adaptive particle count calculations,
 * graphics quality presets, and runtime FPS monitoring to maintain >45 FPS
 * on mobile devices and low-end hardware.
 */

import type { GraphicsQuality } from '@/store/settingsStore'

export interface QualityPreset {
  quality: GraphicsQuality
  maxPixelRatio: number
  antialias: boolean
  particleScale: number
  starfieldDensity: number
  bloomEnabled: boolean
  dofEnabled: boolean
  shadows: boolean
  powerPreference: WebGLPowerPreference
  precision: 'lowp' | 'mediump' | 'highp'
}

export const TARGET_FPS = {
  DESKTOP: 60,
  MOBILE: 45,
  MINIMUM: 30,
} as const

/**
 * Detects whether the current device is a mobile device using coarse pointers,
 * viewport constraints, and user-agent metadata.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  const nav = navigator as Navigator & {
    userAgentData?: { mobile?: boolean }
  }

  if (nav.userAgentData?.mobile !== undefined) {
    return nav.userAgentData.mobile
  }

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 768px)').matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}

/**
 * Detects if the device has constrained hardware (e.g., low logical cores or device memory).
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  const nav = navigator as Navigator & {
    deviceMemory?: number
    hardwareConcurrency?: number
  }

  const isMemoryConstrained = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const isCpuConstrained =
    typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4

  return isMobileDevice() || isMemoryConstrained || isCpuConstrained
}

/**
 * Computes an adaptive particle count based on graphics quality, mobile flag,
 * and optional runtime FPS readings to ensure steady frame rates above 45 FPS.
 */
export function calculateAdaptiveParticleCount(
  baseCount: number,
  quality: GraphicsQuality = 'high',
  isMobile = isMobileDevice(),
  currentFps?: number
): number {
  let multiplier = 1.0

  switch (quality) {
    case 'low':
      multiplier = isMobile ? 0.25 : 0.4
      break
    case 'medium':
      multiplier = isMobile ? 0.5 : 0.75
      break
    case 'high':
    default:
      multiplier = isMobile ? 0.65 : 1.0
      break
  }

  // Dynamic degradation if runtime FPS drops below target
  if (currentFps !== undefined && currentFps > 0) {
    const target = isMobile ? TARGET_FPS.MOBILE : TARGET_FPS.DESKTOP
    if (currentFps < TARGET_FPS.MINIMUM) {
      multiplier *= 0.5
    } else if (currentFps < target) {
      multiplier *= 0.75
    }
  }

  const count = Math.round(baseCount * multiplier)
  return Math.max(1000, count)
}

/**
 * Returns rendering configurations tailored to the specified graphics quality level
 * and target platform.
 */
export function getQualityPreset(
  quality: GraphicsQuality = 'high',
  isMobile = isMobileDevice()
): QualityPreset {
  switch (quality) {
    case 'low':
      return {
        quality: 'low',
        maxPixelRatio: 1.0,
        antialias: false,
        particleScale: 0.35,
        starfieldDensity: 0.4,
        bloomEnabled: false,
        dofEnabled: false,
        shadows: false,
        powerPreference: 'low-power',
        precision: 'mediump',
      }
    case 'medium':
      return {
        quality: 'medium',
        maxPixelRatio: isMobile ? 1.25 : 1.5,
        antialias: !isMobile,
        particleScale: 0.65,
        starfieldDensity: 0.7,
        bloomEnabled: !isMobile,
        dofEnabled: false,
        shadows: false,
        powerPreference: 'default',
        precision: isMobile ? 'mediump' : 'highp',
      }
    case 'high':
    default:
      return {
        quality: 'high',
        maxPixelRatio: isMobile ? 1.5 : 2.0,
        antialias: true,
        particleScale: 1.0,
        starfieldDensity: 1.0,
        bloomEnabled: true,
        dofEnabled: !isMobile,
        shadows: true,
        powerPreference: 'high-performance',
        precision: 'highp',
      }
  }
}

/**
 * Creates a lightweight rolling FPS and performance tracker for in-game monitoring.
 */
export function createPerformanceMonitor(
  targetFps: number = isMobileDevice() ? TARGET_FPS.MOBILE : TARGET_FPS.DESKTOP,
  onDegrade?: () => void,
  onUpgrade?: () => void
) {
  let frames = 0
  let lastTime = performance.now()
  let currentFps: number = targetFps
  let lowFpsCount = 0
  let highFpsCount = 0

  return {
    tick(now = performance.now()): number {
      frames++
      const delta = now - lastTime

      if (delta >= 1000) {
        currentFps = Math.round((frames * 1000) / delta)
        frames = 0
        lastTime = now

        if (currentFps < TARGET_FPS.MINIMUM) {
          lowFpsCount++
          highFpsCount = 0
          if (lowFpsCount >= 3) {
            onDegrade?.()
            lowFpsCount = 0
          }
        } else if (currentFps >= targetFps - 2) {
          highFpsCount++
          lowFpsCount = 0
          if (highFpsCount >= 8) {
            onUpgrade?.()
            highFpsCount = 0
          }
        } else {
          lowFpsCount = 0
          highFpsCount = 0
        }
      }

      return currentFps
    },
    getFps(): number {
      return currentFps
    },
    reset(): void {
      frames = 0
      lastTime = performance.now()
      currentFps = targetFps
      lowFpsCount = 0
      highFpsCount = 0
    },
  }
}
