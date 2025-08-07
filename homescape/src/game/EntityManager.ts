import * as BABYLON from 'babylonjs';
import { Entity } from '../types';
import { Pathfinding } from '../utils/pathfinding';

export default class EntityManager {
  private scene: BABYLON.Scene;
  private pathfinding: Pathfinding;
  private entities: Map<string, Entity> = new Map();
  private meshToEntity: Map<BABYLON.Mesh, Entity> = new Map();

  constructor(scene: BABYLON.Scene, pathfinding: Pathfinding) {
    this.scene = scene;
    this.pathfinding = pathfinding;
  }

  public async loadEntities(entities: Entity[]): Promise<void> {
    for (const entity of entities) {
      await this.createEntity(entity);
    }
  }

  private async createEntity(entity: Entity): Promise<void> {
    let mesh: BABYLON.Mesh;
    
    if (entity.type === 'npc') {
      // Create NPC mesh (simple humanoid shape)
      mesh = BABYLON.MeshBuilder.CreateCapsule(
        entity.id,
        { height: 1.6, radius: 0.25 },
        this.scene
      );
      
      // Create NPC material with unique color
      const npcMat = new BABYLON.StandardMaterial(`${entity.id}_mat`, this.scene);
      const colorIndex = entity.id.charCodeAt(0) % 6;
      const colors = [
        new BABYLON.Color3(0.6, 0.4, 0.8), // Purple
        new BABYLON.Color3(0.4, 0.6, 0.8), // Blue
        new BABYLON.Color3(0.8, 0.6, 0.4), // Orange
        new BABYLON.Color3(0.4, 0.8, 0.6), // Green
        new BABYLON.Color3(0.8, 0.4, 0.6), // Pink
        new BABYLON.Color3(0.6, 0.8, 0.4)  // Yellow-green
      ];
      npcMat.diffuseColor = colors[colorIndex];
      npcMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      mesh.material = npcMat;
      
      // Add a simple hat to distinguish NPCs
      const hat = BABYLON.MeshBuilder.CreateCylinder(
        `${entity.id}_hat`,
        { diameter: 0.4, height: 0.2 },
        this.scene
      );
      hat.parent = mesh;
      hat.position.y = 0.9;
      hat.material = npcMat;
    } else {
      // Create object mesh based on type
      mesh = this.createObjectMesh(entity);
    }
    
    // Position entity on grid
    mesh.position.x = entity.position.x - 6;
    mesh.position.y = entity.type === 'npc' ? 0.8 : 0.5;
    mesh.position.z = entity.position.z - 6;
    
    // Make entity pickable
    mesh.isPickable = true;
    
    // Add hover effect
    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    
    // Store entity references
    this.entities.set(entity.id, entity);
    this.meshToEntity.set(mesh, entity);
    
    // Mark position as blocked in pathfinding
    this.pathfinding.setBlocked(entity.position.x, entity.position.z, true);
    
    // Add hover highlight
    this.addHoverEffect(mesh);
  }

  private createObjectMesh(entity: Entity): BABYLON.Mesh {
    let mesh: BABYLON.Mesh;
    const mat = new BABYLON.StandardMaterial(`${entity.id}_mat`, this.scene);
    
    switch (entity.id) {
      case 'chest-of-projects':
        // Create a chest
        mesh = BABYLON.MeshBuilder.CreateBox(
          entity.id,
          { width: 0.8, height: 0.6, depth: 0.6 },
          this.scene
        );
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
        break;
        
      case 'scroll-of-resume':
        // Create a scroll/cylinder
        mesh = BABYLON.MeshBuilder.CreateCylinder(
          entity.id,
          { diameter: 0.3, height: 0.8 },
          this.scene
        );
        mesh.rotation.z = Math.PI / 2;
        mat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6);
        break;
        
      case 'crystal-of-knowledge':
        // Create a crystal (octahedron)
        mesh = BABYLON.MeshBuilder.CreatePolyhedron(
          entity.id,
          { type: 1, size: 0.4 },
          this.scene
        );
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.8, 0.9);
        mat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.3);
        
        // Add rotation animation
        this.scene.registerBeforeRender(() => {
          mesh.rotation.y += 0.01;
        });
        break;
        
      default:
        // Default cube
        mesh = BABYLON.MeshBuilder.CreateBox(
          entity.id,
          { size: 0.7 },
          this.scene
        );
        mat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    }
    
    mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    mesh.material = mat;
    
    return mesh;
  }

  private addHoverEffect(mesh: BABYLON.Mesh): void {
    let originalEmissive: BABYLON.Color3 | null = null;
    
    mesh.actionManager!.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          const material = mesh.material as BABYLON.StandardMaterial;
          if (material) {
            originalEmissive = material.emissiveColor.clone();
            material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
          }
          
          // Scale up slightly
          mesh.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
        }
      )
    );
    
    mesh.actionManager!.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          const material = mesh.material as BABYLON.StandardMaterial;
          if (material && originalEmissive) {
            material.emissiveColor = originalEmissive;
          }
          
          // Reset scale
          mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        }
      )
    );
  }

  public getEntityByMesh(mesh: BABYLON.Mesh): Entity | null {
    // Check if it's a child mesh (like the hat)
    if (mesh.parent && mesh.parent instanceof BABYLON.Mesh) {
      return this.meshToEntity.get(mesh.parent) || null;
    }
    return this.meshToEntity.get(mesh) || null;
  }

  public getEntity(id: string): Entity | null {
    return this.entities.get(id) || null;
  }
}