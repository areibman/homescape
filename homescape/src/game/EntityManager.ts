import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, AbstractMesh } from '@babylonjs/core'
import { GridSystem } from './GridSystem'
import type { EntityData, GridPosition } from '../types/GameTypes'
import entitiesData from '../data/entities.json'

export class EntityManager {
  private scene: Scene
  private gridSystem: GridSystem
  private entities: EntityData[] = []
  private entityMeshes: Map<string, AbstractMesh> = new Map()
  private meshToEntity: Map<AbstractMesh, EntityData> = new Map()

  constructor(scene: Scene, gridSystem: GridSystem) {
    this.scene = scene
    this.gridSystem = gridSystem
  }

  public async loadEntities(): Promise<void> {
    this.entities = entitiesData.entities as EntityData[]
    
    for (const entity of this.entities) {
      await this.createEntityMesh(entity)
      
      // Mark grid position as occupied
      this.gridSystem.setWalkable(entity.position, false)
    }
  }

  private async createEntityMesh(entity: EntityData): Promise<void> {
    let mesh: AbstractMesh

    if (entity.type === 'npc') {
      // Create NPC mesh (simple cylinder for now)
      mesh = MeshBuilder.CreateCylinder(entity.id, {
        diameter: 0.6,
        height: 1.8
      }, this.scene)

      // NPC material
      const material = new StandardMaterial(`${entity.id}Material`, this.scene)
      material.diffuseColor = new Color3(0.8, 0.6, 0.4) // Skin-like color
      material.specularColor = new Color3(0.1, 0.1, 0.1)
      mesh.material = material

    } else { // object
      // Create object mesh (simple box for now)
      mesh = MeshBuilder.CreateBox(entity.id, {
        width: 0.8,
        height: 0.8,
        depth: 0.8
      }, this.scene)

      // Object material
      const material = new StandardMaterial(`${entity.id}Material`, this.scene)
      material.diffuseColor = new Color3(0.6, 0.4, 0.2) // Brown wood-like color
      material.specularColor = new Color3(0.2, 0.2, 0.2)
      mesh.material = material
    }

    // Position the mesh
    const worldPos = this.gridSystem.gridToWorld(entity.position.x, entity.position.z)
    mesh.position = new Vector3(worldPos.x, mesh.getBoundingInfo().boundingBox.extendSize.y, worldPos.z)

    // Apply scale and rotation if specified
    if (entity.scale) {
      mesh.scaling = new Vector3(entity.scale, entity.scale, entity.scale)
    }
    
    if (entity.rotation) {
      mesh.rotation.y = entity.rotation * Math.PI / 180 // Convert degrees to radians
    }

    // Store references
    this.entityMeshes.set(entity.id, mesh)
    this.meshToEntity.set(mesh, entity)

    // Add hover effect for interactive entities
    if (entity.linkUrl) {
      this.addHoverEffect(mesh)
    }
  }

  private addHoverEffect(mesh: AbstractMesh): void {
    // Store original material - will be used for hover effects later
    // const originalMaterial = mesh.material

    // Add hover enter/exit actions would go here
    // For now, we'll handle highlighting in the pointer events
    console.log('Adding hover effect to', mesh.name)
  }

  public getEntityById(id: string): EntityData | null {
    return this.entities.find(entity => entity.id === id) || null
  }

  public getEntityByMesh(mesh: AbstractMesh): EntityData | null {
    return this.meshToEntity.get(mesh) || null
  }

  public getAllEntities(): EntityData[] {
    return [...this.entities]
  }

  public getEntitiesAtPosition(position: GridPosition): EntityData[] {
    return this.entities.filter(entity => 
      entity.position.x === position.x && entity.position.z === position.z
    )
  }

  public highlightEntity(entityId: string, highlight: boolean): void {
    const mesh = this.entityMeshes.get(entityId)
    if (!mesh || !mesh.material) return

    const material = mesh.material as StandardMaterial
    
    if (highlight) {
      // Add glow effect
      material.emissiveColor = new Color3(0.2, 0.2, 0.0)
    } else {
      // Remove glow effect
      material.emissiveColor = new Color3(0, 0, 0)
    }
  }
}