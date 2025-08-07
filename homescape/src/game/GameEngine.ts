import * as BABYLON from 'babylonjs';
import { Entity, GameSettings, GridPosition } from '../types';
import { Pathfinding } from '../utils/pathfinding';
import entitiesData from '../data/entities.json';
import SceneBuilder from './SceneBuilder';
import InputController from './InputController';
import Player from './Player';
import EntityManager from './EntityManager';

export default class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  private settings: GameSettings;
  private pathfinding: Pathfinding;
  private sceneBuilder: SceneBuilder;
  private inputController: InputController;
  private player: Player;
  private entityManager: EntityManager;
  private ground: BABYLON.Mesh | null = null;
  
  // Event callbacks
  public onContextMenu?: (x: number, y: number, entity: Entity | null) => void;
  public onEntityInteract?: (entity: Entity) => void;
  public onHintTextChange?: (text: string) => void;

  constructor(canvas: HTMLCanvasElement, settings: GameSettings) {
    this.canvas = canvas;
    this.settings = settings;
    
    // Initialize Babylon.js engine
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    });
    
    // Create scene
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1);
    
    // Initialize pathfinding with a 12x12 grid
    this.pathfinding = new Pathfinding(12, 12);
    
    // Create camera
    this.camera = this.createCamera();
    
    // Initialize subsystems
    this.sceneBuilder = new SceneBuilder(this.scene, this.settings);
    this.player = new Player(this.scene, this.pathfinding);
    this.entityManager = new EntityManager(this.scene, this.pathfinding);
    this.inputController = new InputController(
      this.scene,
      this.camera,
      this.canvas,
      this.settings
    );
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private createCamera(): BABYLON.ArcRotateCamera {
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 4, // alpha (rotation around Y)
      Math.PI / 3,  // beta (rotation from top)
      15,           // radius
      new BABYLON.Vector3(6, 0, 6), // target (center of grid)
      this.scene
    );
    
    // Set camera limits
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 25;
    camera.lowerBetaLimit = 0.3;
    camera.upperBetaLimit = Math.PI / 2.2;
    
    // Disable default controls (we'll handle them manually)
    camera.inputs.clear();
    
    return camera;
  }

  private setupEventHandlers(): void {
    // Handle input events
    this.inputController.onGroundClick = (position: GridPosition) => {
      this.player.moveTo(position);
    };
    
    this.inputController.onContextMenu = (x: number, y: number, pickedMesh: BABYLON.Mesh | null) => {
      let entity: Entity | null = null;
      
      if (pickedMesh) {
        entity = this.entityManager.getEntityByMesh(pickedMesh);
      }
      
      if (this.onContextMenu) {
        this.onContextMenu(x, y, entity);
      }
    };
    
    this.inputController.onEntityClick = (entity: Entity) => {
      if (entity.linkUrl && this.onEntityInteract) {
        this.onEntityInteract(entity);
      }
    };
    
    this.inputController.onHover = (mesh: BABYLON.Mesh | null) => {
      if (mesh && this.onHintTextChange) {
        const entity = this.entityManager.getEntityByMesh(mesh);
        if (entity) {
          this.onHintTextChange(`${entity.name} - ${entity.type === 'npc' ? 'Talk' : 'Interact'}`);
        } else if (mesh === this.ground) {
          this.onHintTextChange('Left-click to move. Right-click for options.');
        }
      } else if (this.onHintTextChange) {
        this.onHintTextChange('Left-click to move. Right-click for options.');
      }
    };
  }

  public async initialize(): Promise<void> {
    // Set pathfinding for scene builder
    this.sceneBuilder.setPathfinding(this.pathfinding);
    
    // Build the scene
    this.ground = await this.sceneBuilder.buildScene();
    
    // Initialize player
    await this.player.initialize();
    
    // Load entities from JSON
    const entities = entitiesData.entities as Entity[];
    await this.entityManager.loadEntities(entities);
    
    // Set ground for input controller
    this.inputController.setGround(this.ground);
    
    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
    this.sceneBuilder.updateQuality(settings.quality);
    this.inputController.updateSettings(settings);
  }

  public moveToEntity(entity: Entity): void {
    // Find adjacent free position
    const adjacentPositions = [
      { x: entity.position.x + 1, z: entity.position.z },
      { x: entity.position.x - 1, z: entity.position.z },
      { x: entity.position.x, z: entity.position.z + 1 },
      { x: entity.position.x, z: entity.position.z - 1 }
    ];
    
    for (const pos of adjacentPositions) {
      if (!this.pathfinding.isBlocked(pos.x, pos.z)) {
        this.player.moveTo(pos);
        break;
      }
    }
  }

  public dispose(): void {
    this.inputController.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}