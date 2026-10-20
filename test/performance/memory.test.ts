import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { renderHook } from '@testing-library/react'
import {
  disposeGeometry,
  disposeMaterial,
  disposeTexture,
  disposeHierarchy,
  disposeWebGLRenderer,
  cleanScene,
} from '@/utils/three-cleanup'
import { useThreeScene } from '@/hooks/useThreeScene'

describe('Three.js Scene Memory Cleanup (#352)', () => {
  it('disposes BufferGeometry cleanly', () => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2])
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const disposeSpy = vi.spyOn(geometry, 'dispose')
    disposeGeometry(geometry)
    expect(disposeSpy).toHaveBeenCalledTimes(1)
  })

  it('disposes standalone Texture cleanly', () => {
    const texture = new THREE.Texture()
    const texDisposeSpy = vi.spyOn(texture, 'dispose')
    disposeTexture(texture)
    expect(texDisposeSpy).toHaveBeenCalledTimes(1)
  })

  it('disposes Material and attached texture maps', () => {
    const material = new THREE.MeshBasicMaterial()
    const texture = new THREE.Texture()
    material.map = texture

    const matDisposeSpy = vi.spyOn(material, 'dispose')
    const texDisposeSpy = vi.spyOn(texture, 'dispose')

    disposeMaterial(material)

    expect(matDisposeSpy).toHaveBeenCalledTimes(1)
    expect(texDisposeSpy).toHaveBeenCalledTimes(1)
    expect(material.map).toBeNull()
  })

  it('disposes multi-material arrays and nested textures', () => {
    const mat1 = new THREE.MeshBasicMaterial()
    const mat2 = new THREE.MeshStandardMaterial()
    const tex = new THREE.Texture()
    mat2.roughnessMap = tex

    const spy1 = vi.spyOn(mat1, 'dispose')
    const spy2 = vi.spyOn(mat2, 'dispose')
    const texSpy = vi.spyOn(tex, 'dispose')

    disposeMaterial([mat1, mat2])

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)
    expect(texSpy).toHaveBeenCalledTimes(1)
  })

  it('recursively disposes object hierarchy and detaches all children', () => {
    const root = new THREE.Group()
    const child1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial())
    const subChild = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial())

    child1.add(subChild)
    root.add(child1)

    const geom1Spy = vi.spyOn(child1.geometry, 'dispose')
    const mat1Spy = vi.spyOn(child1.material, 'dispose')
    const geom2Spy = vi.spyOn(subChild.geometry, 'dispose')
    const mat2Spy = vi.spyOn(subChild.material as THREE.Material, 'dispose')

    disposeHierarchy(root)

    expect(geom1Spy).toHaveBeenCalledTimes(1)
    expect(mat1Spy).toHaveBeenCalledTimes(1)
    expect(geom2Spy).toHaveBeenCalledTimes(1)
    expect(mat2Spy).toHaveBeenCalledTimes(1)
    expect(root.children.length).toBe(0)
  })

  it('disposes WebGLRenderer and forces context loss to prevent WebGL leaks', () => {
    const renderer = {
      dispose: vi.fn(),
      forceContextLoss: vi.fn(),
      renderLists: { dispose: vi.fn() },
      domElement: document.createElement('canvas'),
    } as unknown as THREE.WebGLRenderer

    disposeWebGLRenderer(renderer)

    expect(renderer.dispose).toHaveBeenCalledTimes(1)
    expect(renderer.forceContextLoss).toHaveBeenCalledTimes(1)
    expect(renderer.renderLists.dispose).toHaveBeenCalledTimes(1)
  })

  it('cleanScene cleans both scene hierarchy and renderer', () => {
    const scene = new THREE.Scene()
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial())
    scene.add(mesh)

    const renderer = {
      dispose: vi.fn(),
      forceContextLoss: vi.fn(),
      renderLists: { dispose: vi.fn() },
      domElement: document.createElement('canvas'),
    } as unknown as THREE.WebGLRenderer

    const sceneClearSpy = vi.spyOn(scene, 'clear')
    cleanScene(scene, renderer)

    expect(sceneClearSpy).toHaveBeenCalled()
    expect(renderer.dispose).toHaveBeenCalled()
  })

  it('useThreeScene automatically cleans up resources upon unmount', () => {
    const { result, unmount } = renderHook(() => useThreeScene())

    const geom = new THREE.BoxGeometry()
    const mat = new THREE.MeshBasicMaterial()
    const mesh = new THREE.Mesh(geom, mat)
    result.current.scene.add(mesh)

    const geomSpy = vi.spyOn(geom, 'dispose')
    const matSpy = vi.spyOn(mat, 'dispose')

    unmount()

    expect(geomSpy).toHaveBeenCalled()
    expect(matSpy).toHaveBeenCalled()
    expect(result.current.scene.children.length).toBe(0)
  })
})
