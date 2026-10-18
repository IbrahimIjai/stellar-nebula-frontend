import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { settingsStoreKey } from './storageKeys'
import { createVersionedMigrate } from './stateMigration'

export type GraphicsQuality = 'low' | 'medium' | 'high'
export type StellarNetwork = 'futurenet' | 'testnet' | 'mainnet'

export interface SettingsState {
  graphicsQuality: GraphicsQuality
  soundEnabled: boolean
  notificationsEnabled: boolean
  analyticsEnabled: boolean
  network: StellarNetwork
  /** Dynamic quality adjustment to sustain target FPS (#351) */
  adaptivePerformance: boolean
  /** Target frames per second (60 desktop, 45 mobile) (#351) */
  targetFps: number
  /** Multiplier for particle system counts (0.25 - 1.0) (#351) */
  particleCountMultiplier: number
  /** Enables in-game FPS counter and monitoring (#351) */
  fpsMonitoringEnabled: boolean
  /** Aggressive power-saving mode for low-battery or mobile devices (#351) */
  lowPowerMode: boolean
}

export interface SettingsActions {
  setGraphicsQuality: (quality: GraphicsQuality) => void
  setSoundEnabled: (enabled: boolean) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setAnalyticsEnabled: (enabled: boolean) => void
  setNetwork: (network: StellarNetwork) => void
  setAdaptivePerformance: (enabled: boolean) => void
  setTargetFps: (fps: number) => void
  setParticleCountMultiplier: (multiplier: number) => void
  setFpsMonitoringEnabled: (enabled: boolean) => void
  setLowPowerMode: (enabled: boolean) => void
  applyMobileDefaults: () => void
}

export type SettingsStore = SettingsState & SettingsActions

export { settingsStoreKey }

/** Bump whenever the shape of the persisted SettingsState slice changes. */
export const SETTINGS_STORE_SCHEMA_VERSION = 2

export const initialSettingsState: SettingsState = {
  graphicsQuality: 'high',
  soundEnabled: true,
  notificationsEnabled: true,
  analyticsEnabled: true,
  network: 'futurenet',
  adaptivePerformance: true,
  targetFps: 60,
  particleCountMultiplier: 1.0,
  fpsMonitoringEnabled: false,
  lowPowerMode: false,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettingsState,
      setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      setNetwork: (network) => set({ network }),
      setAdaptivePerformance: (adaptivePerformance) => set({ adaptivePerformance }),
      setTargetFps: (targetFps) => set({ targetFps }),
      setParticleCountMultiplier: (particleCountMultiplier) => set({ particleCountMultiplier }),
      setFpsMonitoringEnabled: (fpsMonitoringEnabled) => set({ fpsMonitoringEnabled }),
      setLowPowerMode: (lowPowerMode) =>
        set((state) => ({
          lowPowerMode,
          graphicsQuality: lowPowerMode ? 'low' : state.graphicsQuality,
          particleCountMultiplier: lowPowerMode ? 0.35 : 1.0,
          targetFps: lowPowerMode ? 30 : 60,
        })),
      applyMobileDefaults: () =>
        set({
          graphicsQuality: 'medium',
          targetFps: 45,
          particleCountMultiplier: 0.65,
          adaptivePerformance: true,
        }),
    }),
    {
      name: settingsStoreKey,
      storage: createJSONStorage(() => localStorage),
      version: SETTINGS_STORE_SCHEMA_VERSION,
      partialize: ({
        graphicsQuality,
        soundEnabled,
        notificationsEnabled,
        analyticsEnabled,
        network,
        adaptivePerformance,
        targetFps,
        particleCountMultiplier,
        fpsMonitoringEnabled,
        lowPowerMode,
      }) => ({
        graphicsQuality,
        soundEnabled,
        notificationsEnabled,
        analyticsEnabled,
        network,
        adaptivePerformance,
        targetFps,
        particleCountMultiplier,
        fpsMonitoringEnabled,
        lowPowerMode,
      }),
      migrate: createVersionedMigrate('settingsStore', SETTINGS_STORE_SCHEMA_VERSION, (state) => ({
        ...initialSettingsState,
        ...(state as Partial<SettingsState>),
      })),
    }
  )
)
