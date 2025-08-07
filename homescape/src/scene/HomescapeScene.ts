import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import type { Nullable } from '@babylonjs/core/types'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'

import { aStar, findAdjacentWalkable, keyOf } from './grid'
import type { GridConfig } from './grid'

export type SceneEntity = {
  id: string
  type: 'npc' | 'object'
  grid: [number, number]
  label: string
  examine?: string
  linkUrl?: string
}

export type SceneController = {
  moveAdjacentTo: (entity: SceneEntity) => void
}

export function createHomescapeScene(params: {
  canvas: HTMLCanvasElement
  entities: SceneEntity[]
  quality: 'low' | 'medium' | 'high'
  invertedCamera: boolean
  onContextMenu: (entity: SceneEntity, screen: { x: number, y: number }) => void
  onOpenLink: (entity: SceneEntity) => void
  onCloseUI: () => void
}): { controller: SceneController, dispose: () => void } {
  const engine = new Engine(params.canvas, true, { preserveDrawingBuffer: true, stencil: true, doNotHandleContextLost: true })
  const scene = new Scene(engine)

  // Quality scaling
  if (params.quality === 'low') engine.setHardwareScalingLevel(1.5)
  if (params.quality === 'medium') engine.setHardwareScalingLevel(1)
  if (params.quality === 'high') engine.setHardwareScalingLevel(0.75)

  const camera = new ArcRotateCamera('cam', Math.PI * 0.75, Math.PI * 0.6, 18, new Vector3(5, 0, 5), scene)
  camera.lowerBetaLimit = Math.PI * 0.35
  camera.upperBetaLimit = Math.PI * 0.8
  camera.lowerRadiusLimit = 6
  camera.upperRadiusLimit = 40
  camera.useAutoRotationBehavior = false
  camera.panningSensibility = 0 // disable right-drag pan to avoid conflict
  camera.attachControl(params.canvas, true)

  const light = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
  light.intensity = 0.95

  const gridSize = 12
  const gridCfg: GridConfig = {
    width: gridSize,
    height: gridSize,
    blocked: new Set<string>(),
    allowDiagonals: false,
  }

  // Ground grid plane
  const ground = MeshBuilder.CreateGround('ground', { width: gridSize, height: gridSize, subdivisions: gridSize }, scene)
  const groundMat = new StandardMaterial('groundMat', scene)
  groundMat.diffuseColor = new Color3(0.23, 0.27, 0.36)
  groundMat.specularColor = new Color3(0, 0, 0)
  ground.material = groundMat
  ground.position = new Vector3(gridSize / 2 - 0.5, 0, gridSize / 2 - 0.5)

  // Draw subtle grid lines via thin boxes
  for (let i = 0; i <= gridSize; i++) {
    const lineX = MeshBuilder.CreateBox(`gx${i}`, { width: gridSize, height: 0.02, depth: 0.02 }, scene)
    lineX.position = new Vector3(gridSize / 2 - 0.5, 0.01, i - 0.5)
    lineX.material = groundMat
    const lineZ = MeshBuilder.CreateBox(`gz${i}`, { width: 0.02, height: 0.02, depth: gridSize }, scene)
    lineZ.position = new Vector3(i - 0.5, 0.01, gridSize / 2 - 0.5)
    lineZ.material = groundMat
  }

  // Player
  const player = MeshBuilder.CreateCapsule('player', { height: 1.6, radius: 0.35 }, scene)
  const playerMat = new StandardMaterial('playerMat', scene)
  playerMat.diffuseColor = new Color3(0.8, 0.85, 0.9)
  playerMat.specularColor = new Color3(0, 0, 0)
  player.material = playerMat
  let playerGrid = { x: 5, y: 9 }
  player.position = new Vector3(playerGrid.x, 0.8, playerGrid.y)

  // Entities and highlight
  const hl = new HighlightLayer('hl', scene)

  const entityByMeshId = new Map<string, SceneEntity>()

  for (const e of params.entities) {
    const isNpc = e.type === 'npc'
    const node = isNpc
      ? MeshBuilder.CreateCylinder(e.id, { height: 1.4, diameterTop: 0.6, diameterBottom: 0.9, tessellation: 5 }, scene)
      : MeshBuilder.CreateBox(e.id, { size: 1 }, scene)
    node.position = new Vector3(e.grid[0], isNpc ? 0.7 : 0.5, e.grid[1])
    const mat = new StandardMaterial(`${e.id}_mat`, scene)
    mat.diffuseColor = isNpc ? new Color3(0.6, 0.8, 0.6) : new Color3(0.8, 0.6, 0.5)
    mat.specularColor = new Color3(0, 0, 0)
    node.material = mat

    entityByMeshId.set(node.id, e)
  }

  // Block occupied cells
  for (const e of params.entities) {
    gridCfg.blocked.add(keyOf(e.grid[0], e.grid[1]))
  }

  // Movement
  let path: { x: number, y: number }[] = []
  let pathIndex = 0
  let clickMarker: Nullable<Mesh> = null

  function showClickMarker(x: number, y: number) {
    if (clickMarker) clickMarker.dispose()
    clickMarker = MeshBuilder.CreateCylinder('marker', { height: 0.02, diameter: 0.6, tessellation: 12 }, scene)
    const m = new StandardMaterial('markerMat', scene)
    m.diffuseColor = new Color3(0.95, 0.85, 0.55)
    m.emissiveColor = new Color3(0.2, 0.18, 0.06)
    m.specularColor = new Color3(0, 0, 0)
    clickMarker.material = m
    clickMarker.position = new Vector3(x, 0.02, y)
  }

  function moveToGrid(target: { x: number, y: number }) {
    const pathFound = aStar(gridCfg, playerGrid, target)
    if (!pathFound || pathFound.length === 0) return
    path = pathFound.slice(1)
    pathIndex = 0
  }

  function moveAdjacentTo(entity: SceneEntity) {
    const adj = findAdjacentWalkable(gridCfg, { x: entity.grid[0], y: entity.grid[1] })
    if (!adj) return
    moveToGrid(adj)
  }

  // Animate step-by-step
  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000
    const speed = 3 // units per second
    if (path && pathIndex < path.length) {
      const target = path[pathIndex]
      const targetPos = new Vector3(target.x, 0.8, target.y)
      const dir = targetPos.subtract(player.position)
      const dist = dir.length()
      if (dist < 0.02) {
        playerGrid = { x: target.x, y: target.y }
        pathIndex += 1
      } else {
        const step = Math.min(dist, speed * dt)
        player.position = player.position.add(dir.normalize().scale(step))
      }
    }
  })

  // Picking and inputs
  const pickPredicate = (_mesh: any) => true

  function onLeftClick(_evt: PointerEvent) {
    const pick = scene.pick(scene.pointerX, scene.pointerY, pickPredicate)
    if (pick?.hit) {
      const mesh = pick.pickedMesh
      if (mesh && mesh !== ground && entityByMeshId.has(mesh.id)) {
        const entity = entityByMeshId.get(mesh.id)!
        moveAdjacentTo(entity)
        showClickMarker(entity.grid[0], entity.grid[1])
      } else if (pick.pickedPoint) {
        const gx = Math.round(pick.pickedPoint.x)
        const gy = Math.round(pick.pickedPoint.z)
        if (gx >= 0 && gy >= 0 && gx < gridSize && gy < gridSize && !gridCfg.blocked.has(keyOf(gx, gy))) {
          moveToGrid({ x: gx, y: gy })
          showClickMarker(gx, gy)
        }
      }
    }
  }

  function onRightClick(evt: PointerEvent) {
    const pick = scene.pick(scene.pointerX, scene.pointerY, pickPredicate)
    if (pick?.hit && pick.pickedMesh && entityByMeshId.has(pick.pickedMesh.id)) {
      const entity = entityByMeshId.get(pick.pickedMesh.id)!
      const pos = { x: (evt as any).clientX ?? 0, y: (evt as any).clientY ?? 0 }
      params.onContextMenu(entity, pos)
    }
  }

  // Keyboard for camera
  window.addEventListener('keydown', (e) => {
    const invert = params.invertedCamera ? -1 : 1
    if (e.key === 'ArrowLeft') camera.alpha -= 0.1 * invert
    if (e.key === 'ArrowRight') camera.alpha += 0.1 * invert
    if (e.key === 'ArrowUp') camera.radius = Math.max(camera.lowerRadiusLimit ?? 4, camera.radius - 0.75)
    if (e.key === 'ArrowDown') camera.radius = Math.min(camera.upperRadiusLimit ?? 40, camera.radius + 0.75)
  })

  // Mouse and touch pointer observable: wheel zoom, hover highlight
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERWHEEL) {
      const e = pointerInfo.event as WheelEvent
      camera.radius = Math.max(camera.lowerRadiusLimit ?? 4, Math.min(camera.upperRadiusLimit ?? 40, camera.radius + (e.deltaY > 0 ? 1 : -1)))
    }
    if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
      hl.removeAllMeshes()
      const pick = scene.pick(scene.pointerX, scene.pointerY, pickPredicate)
      if (pick?.hit && pick.pickedMesh && entityByMeshId.has(pick.pickedMesh.id)) {
        hl.addMesh(pick.pickedMesh as Mesh, Color3.FromHexString('#F0C35A'))
      }
    }
  })

  // Pointer events
  let pressTimer: number | null = null
  let startPos: { x: number, y: number } | null = null
  params.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  params.canvas.addEventListener('pointerdown', (e) => {
    startPos = { x: e.clientX, y: e.clientY }
    if (e.button === 0) {
      // schedule long-press for context on mobile
      pressTimer = window.setTimeout(() => {
        const pick = scene.pick(scene.pointerX, scene.pointerY, pickPredicate)
        if (pick?.hit && pick.pickedMesh && entityByMeshId.has(pick.pickedMesh.id)) {
          const entity = entityByMeshId.get(pick.pickedMesh.id)!
          params.onContextMenu(entity, { x: e.clientX, y: e.clientY })
        }
      }, 420)
    }
  })
  params.canvas.addEventListener('pointerup', (e) => {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
    // consider a click if minimal movement
    if (e.button === 0 && startPos && Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) < 6) {
      onLeftClick(e)
    }
    if (e.button === 2) {
      onRightClick(e)
    }
    startPos = null
  })

  // Basic two-finger gestures for mobile: pinch zoom, rotate with horizontal movement
  const touches = new Map<number, { x: number, y: number }>()
  params.canvas.addEventListener('pointermove', (e) => {
    if (pressTimer && startPos && Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) > 8) {
      clearTimeout(pressTimer); pressTimer = null
    }
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touches.size >= 2) {
        const arr = Array.from(touches.values())
        const [a, b] = arr
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        // store prev on element
        const prev = (params.canvas as any)._prevPinch as number | undefined
        const prevDx = (params.canvas as any)._prevDx as number | undefined
        if (prev !== undefined) {
          const delta = dist - prev
          camera.radius = Math.max(camera.lowerRadiusLimit ?? 4, Math.min(camera.upperRadiusLimit ?? 40, camera.radius - delta * 0.01))
        }
        if (prevDx !== undefined) {
          const deltaX = dx - prevDx
          camera.alpha += deltaX * 0.005 * (params.invertedCamera ? -1 : 1)
        }
        ;(params.canvas as any)._prevPinch = dist
        ;(params.canvas as any)._prevDx = dx
      }
    }
  })
  params.canvas.addEventListener('pointercancel', () => { touches.clear() })
  params.canvas.addEventListener('pointerout', () => { touches.clear() })
  params.canvas.addEventListener('pointerleave', () => { touches.clear() })

  engine.runRenderLoop(() => { scene.render() })

  function dispose() {
    engine.stopRenderLoop()
    scene.dispose()
    engine.dispose()
  }

  return { controller: { moveAdjacentTo }, dispose }
}