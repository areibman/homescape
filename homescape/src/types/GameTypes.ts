export interface GameSettings {
  quality: 'low' | 'medium' | 'high'
  audioEnabled: boolean
  invertCamera: boolean
}

export interface Vector2 {
  x: number
  y: number
}

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface GridPosition {
  x: number
  z: number
}

export interface EntityData {
  id: string
  type: 'npc' | 'object'
  position: GridPosition
  name: string
  description: string
  examineText: string
  linkUrl?: string
  linkTitle?: string
  linkDescription?: string
  meshName?: string
  scale?: number
  rotation?: number
}

export interface ContextMenuData {
  entityId: string
  entityName: string
  position: Vector2
  actions: string[]
}

export interface LinkData {
  title: string
  description: string
  url: string
  entityName: string
}

export interface PathNode {
  x: number
  z: number
  g: number
  h: number
  f: number
  parent: PathNode | null
  walkable: boolean
}

export interface GameState {
  playerPosition: GridPosition
  isMoving: boolean
  targetPosition: GridPosition | null
  currentPath: GridPosition[]
  selectedEntity: string | null
}

export interface CameraState {
  target: Vector3
  alpha: number
  beta: number
  radius: number
}

export type QualityLevel = 'low' | 'medium' | 'high'

export interface QualitySettings {
  shadowsEnabled: boolean
  textureQuality: number
  renderScale: number
  antialiasingEnabled: boolean
  maxLights: number
}