import * as BABYLON from 'babylonjs';
import { GridPosition } from '../types';
import { Pathfinding } from '../utils/pathfinding';

export default class Player {
  private scene: BABYLON.Scene;
  private pathfinding: Pathfinding;
  private mesh: BABYLON.Mesh | null = null;
  private currentPosition: GridPosition = { x: 6, z: 9 }; // Start position
  private targetPosition: GridPosition | null = null;
  private currentPath: GridPosition[] = [];
  private pathIndex: number = 0;
  private moveSpeed: number = 3; // Units per second
  private isMoving: boolean = false;

  constructor(scene: BABYLON.Scene, pathfinding: Pathfinding) {
    this.scene = scene;
    this.pathfinding = pathfinding;
  }

  public async initialize(): Promise<void> {
    // Create player mesh (simple capsule for now)
    this.mesh = BABYLON.MeshBuilder.CreateCapsule(
      'player',
      { height: 1.8, radius: 0.3 },
      this.scene
    );
    
    // Create player material
    const playerMat = new BABYLON.StandardMaterial('playerMat', this.scene);
    playerMat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.4);
    playerMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    this.mesh.material = playerMat;
    
    // Set initial position
    this.updateMeshPosition();
    
    // Mark player position as blocked
    this.pathfinding.setBlocked(this.currentPosition.x, this.currentPosition.z, true);
    
    // Start animation loop
    this.scene.registerBeforeRender(() => {
      this.update();
    });
  }

  private updateMeshPosition(): void {
    if (this.mesh) {
      this.mesh.position.x = this.currentPosition.x - 6; // Center on grid
      this.mesh.position.y = 0.9; // Half height above ground
      this.mesh.position.z = this.currentPosition.z - 6; // Center on grid
    }
  }

  public moveTo(targetPosition: GridPosition): void {
    // Don't move if already at target or moving to same position
    if (this.currentPosition.x === targetPosition.x && 
        this.currentPosition.z === targetPosition.z) {
      return;
    }
    
    // Find path
    const path = this.pathfinding.findPath(this.currentPosition, targetPosition);
    if (path && path.length > 1) {
      // Remove first position (current position)
      path.shift();
      
      this.currentPath = path;
      this.pathIndex = 0;
      this.targetPosition = targetPosition;
      this.isMoving = true;
    }
  }

  private update(): void {
    if (!this.isMoving || !this.mesh || this.currentPath.length === 0) {
      return;
    }
    
    const deltaTime = this.scene.getEngine().getDeltaTime() / 1000; // Convert to seconds
    const currentTarget = this.currentPath[this.pathIndex];
    
    // Calculate world positions
    const targetWorldPos = new BABYLON.Vector3(
      currentTarget.x - 6,
      0.9,
      currentTarget.z - 6
    );
    
    // Calculate direction
    const direction = targetWorldPos.subtract(this.mesh.position);
    const distance = direction.length();
    
    if (distance < 0.1) {
      // Reached current waypoint
      // Update pathfinding grid
      this.pathfinding.setBlocked(this.currentPosition.x, this.currentPosition.z, false);
      this.currentPosition = currentTarget;
      this.pathfinding.setBlocked(this.currentPosition.x, this.currentPosition.z, true);
      
      this.pathIndex++;
      
      if (this.pathIndex >= this.currentPath.length) {
        // Reached destination
        this.isMoving = false;
        this.currentPath = [];
        this.targetPosition = null;
      }
    } else {
      // Move towards target
      direction.normalize();
      const moveDistance = this.moveSpeed * deltaTime;
      
      if (moveDistance >= distance) {
        // Will reach target this frame
        this.mesh.position = targetWorldPos;
      } else {
        // Move towards target
        this.mesh.position.addInPlace(direction.scale(moveDistance));
      }
      
      // Rotate to face movement direction
      if (direction.x !== 0 || direction.z !== 0) {
        const angle = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = angle;
      }
    }
  }

  public getPosition(): GridPosition {
    return { ...this.currentPosition };
  }
}