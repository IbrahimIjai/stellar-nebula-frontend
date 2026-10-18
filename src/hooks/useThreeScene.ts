/**
 * Hook for managing Three.js scene lifecycle with automatic cleanup (#352).
 *
 * Ensures all geometries, materials, textures, and renderer resources
 * are properly disposed when the component unmounts to prevent memory leaks.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import {
  cleanScene,
  disposeGeometry,
  disposeMaterial,
  disposeTexture,
  disposeHierarchy,
  disposeWebGLRenderer,
} from '@/utils/three-cleanup'

export interface UseThreeSceneOptions {
  /** Optional custom camera */
  camera?: THREE.Camera
  /** Optional container element ref or selector */
  containerRef?: React.RefObject<HTMLElement | null>
  /** Whether to initialize a standard WebGLRenderer */
  createRenderer?: boolean
  /** Antialias setting */
  antialias?: boolean
}

export function useThreeScene(options: UseThreeSceneOptions = {}) {
  const [scene] = useState(() => new THREE.Scene())
  const [camera] = useState(() => options.camera ?? new THREE.PerspectiveCamera(60, 1, 0.1, 1000))
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const disposablesRef = useRef<Set<{ dispose?: () => void }>>(new Set())

  useEffect(() => {
    let createdRenderer: THREE.WebGLRenderer | null = null

    if (options.createRenderer && options.containerRef?.current && !rendererRef.current) {
      const container = options.containerRef.current
      createdRenderer = new THREE.WebGLRenderer({
        antialias: options.antialias ?? true,
        powerPreference: 'high-performance',
      })
      createdRenderer.setSize(container.clientWidth || 300, container.clientHeight || 150)
      createdRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(createdRenderer.domElement)
      rendererRef.current = createdRenderer
      setRenderer(createdRenderer)
    }

    const disposables = disposablesRef.current

    return () => {
      // 1. Dispose registered individual resources
      disposables.forEach((item) => {
        try {
          item.dispose?.()
        } catch {
          // ignore
        }
      })
      disposables.clear()

      // 2. Recursively dispose all scene objects and renderer
      cleanScene(scene, rendererRef.current)
      rendererRef.current = null
      setRenderer(null)
    }
  }, [options.createRenderer, options.containerRef, options.antialias, scene])

  const registerDisposable = useCallback(<T extends { dispose?: () => void }>(resource: T): T => {
    if (resource && typeof resource.dispose === 'function') {
      disposablesRef.current.add(resource)
    }
    return resource
  }, [])

  return {
    scene,
    camera,
    renderer,
    getRenderer: () => rendererRef.current,
    registerDisposable,
    disposeGeometry,
    disposeMaterial,
    disposeTexture,
    disposeHierarchy,
    disposeRenderer: disposeWebGLRenderer,
  }
}

export default useThreeScene
