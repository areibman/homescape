import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Animation } from '@babylonjs/core'
import { GridSystem } from './GridSystem'
import type { GridPosition } from '../types/GameTypes'

export class PlayerController {
  private scene: Scene
  private gridSystem: GridSystem
  private playerMesh: any // AbstractMesh
  private currentPosition: GridPosition
  // private targetPosition: GridPosition | null = null
  private currentPath: GridPosition[] = []
  private isMoving: boolean = false
  private moveSpeed: number = 2 // Units per second
  // private animationGroup: AnimationGroup | null = null

  constructor(scene: Scene, gridSystem: GridSystem) {
    this.scene = scene
    this.gridSystem = gridSystem
    
    // Start at center of grid
    this.currentPosition = {
      x: Math.floor(gridSystem.width / 2),
      z: Math.floor(gridSystem.height / 2)
    }
  }

  public async initialize(): Promise<void> {
    await this.createPlayerMesh()
    this.createAnimations()
    this.updateWorldPosition()
  }

  private async createPlayerMesh(): Promise<void> {
    // Create a simple capsule for the player
    this.playerMesh = MeshBuilder.CreateCapsule('player', {
      radius: 0.3,
      height: 1.8
    }, this.scene)

    // Create player material
    const playerMaterial = new StandardMaterial('playerMaterial', this.scene)
    playerMaterial.diffuseColor = new Color3(0.2, 0.4, 0.8) // Blue color
    playerMaterial.specularColor = new Color3(0.1, 0.1, 0.1)
    this.playerMesh.material = playerMaterial

    // Position slightly above ground
    this.playerMesh.position.y = 0.9
  }

  private createAnimations(): void {
    // Create idle animation (subtle bobbing)
    Animation.CreateAndStartAnimation(
      'playerIdle',
      this.playerMesh,
      'position.y',
      30, // FPS
      120, // Total frames
      0.9, // Start value
      1.0, // End value
      Animation.ANIMATIONLOOPMODE_CYCLE
    )

    // Create simple walking animation (will be enhanced when moving)
    // this.animationGroup = new AnimationGroup('playerAnimations', this.scene)
  }

  public moveToPosition(targetPos: GridPosition): void {
    if (!this.gridSystem.isValidPosition(targetPos)) {
      return
    }

    // Find path to target
    const path = this.gridSystem.findPath(this.currentPosition, targetPos)
    
    if (path.length > 1) { // Path includes start position
      this.currentPath = path.slice(1) // Remove start position
      // this.targetPosition = targetPos
      this.isMoving = true
    }
  }

  public update(): void {
    if (!this.isMoving || this.currentPath.length === 0) {
      return
    }

    const nextGridPos = this.currentPath[0]
    const nextWorldPos = this.gridSystem.gridToWorld(nextGridPos.x, nextGridPos.z)
    const currentWorldPos = this.playerMesh.position

    // Calculate direction to next position
    const direction = new Vector3(
      nextWorldPos.x - currentWorldPos.x,
      0,
      nextWorldPos.z - currentWorldPos.z
    )

    const distance = direction.length()
    
    if (distance < 0.1) {
      // Reached current waypoint, move to next
      this.currentPosition = nextGridPos
      this.currentPath.shift()
      
      if (this.currentPath.length === 0) {
        // Reached final destination
        this.isMoving = false
        // this.targetPosition = null
        this.snapToGrid()
      }
    } else {
      // Move towards next waypoint
      direction.normalize()
      const moveDistance = this.moveSpeed * this.scene.getEngine().getDeltaTime() / 1000
      
      this.playerMesh.position.addInPlace(direction.scale(moveDistance))
      
      // Rotate player to face movement direction
      if (direction.length() > 0) {
        const angle = Math.atan2(direction.x, direction.z)
        this.playerMesh.rotation.y = angle
      }
    }
  }

  private updateWorldPosition(): void {
    const worldPos = this.gridSystem.gridToWorld(this.currentPosition.x, this.currentPosition.z)
    this.playerMesh.position.x = worldPos.x
    this.playerMesh.position.z = worldPos.z
  }

  private snapToGrid(): void {
    // Ensure player is exactly on grid position
    this.updateWorldPosition()
  }

  public getPosition(): GridPosition {
    return { ...this.currentPosition }
  }

  public getWorldPosition(): Vector3 {
    return this.playerMesh.position.clone()
  }

  public isPlayerMoving(): boolean {
    return this.isMoving
  }

  public getMesh(): any {
    return this.playerMesh
  }
}