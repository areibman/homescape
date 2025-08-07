import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, PickingInfo, PointerEventTypes, PointerInfo } from '@babylonjs/core'
import { GridSystem } from './GridSystem'
import { PlayerController } from './PlayerController'
import { EntityManager } from './EntityManager'
import { CameraController } from './CameraController'
import { InputManager } from './InputManager'
import type { GameSettings, ContextMenuData, LinkData, Vector2 } from '../types/GameTypes'

export class GameScene {
  private engine: Engine
  private scene: Scene
  private camera: ArcRotateCamera
  private canvas: HTMLCanvasElement
  private settings: GameSettings

  // Game systems
  private gridSystem: GridSystem
  private playerController: PlayerController
  private entityManager: EntityManager
  private cameraController: CameraController
  private inputManager: InputManager

  // Event callbacks
  public onContextMenu: ((data: ContextMenuData) => void) | null = null
  public onLinkClick: ((data: LinkData) => void) | null = null

  constructor(canvas: HTMLCanvasElement, settings: GameSettings) {
    this.canvas = canvas
    this.settings = settings
    
    // Initialize Babylon.js engine
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: settings.quality !== 'low'
    })

    // Create scene
    this.scene = new Scene(this.engine)
    
    // Initialize camera
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2, // alpha (rotation around Y axis)
      Math.PI / 3,  // beta (rotation around X axis) 
      15,           // radius
      Vector3.Zero(), // target
      this.scene
    )

    // Initialize game systems
    this.gridSystem = new GridSystem(10, 10) // 10x10 grid
    this.playerController = new PlayerController(this.scene, this.gridSystem)
    this.entityManager = new EntityManager(this.scene, this.gridSystem)
    this.cameraController = new CameraController(this.camera, settings.invertCamera)
    this.inputManager = new InputManager(this.canvas, this.scene)

    this.setupEventHandlers()
  }

  public async initialize(): Promise<void> {
    // Set up lighting
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene)
    light.intensity = 0.7

    // Create ground
    await this.createGround()

    // Load entities
    await this.entityManager.loadEntities()

    // Set up player
    await this.playerController.initialize()

    // Position camera to look at player
    const playerPos = this.playerController.getPosition()
    this.camera.setTarget(new Vector3(playerPos.x, 0, playerPos.z))

    // Apply quality settings
    this.applyQualitySettings()

    // Start render loop
    this.engine.runRenderLoop(() => {
      this.update()
      this.scene.render()
    })

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  private async createGround(): Promise<void> {
    const ground = MeshBuilder.CreateGround('ground', {
      width: this.gridSystem.width,
      height: this.gridSystem.height
    }, this.scene)

    const groundMaterial = new StandardMaterial('groundMaterial', this.scene)
    groundMaterial.diffuseColor = new Color3(0.3, 0.5, 0.2) // Green grass color
    groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1)
    ground.material = groundMaterial

    // Create grid lines for debugging (only in medium/high quality)
    if (this.settings.quality !== 'low') {
      this.createGridLines()
    }
  }

  private createGridLines(): void {
    const gridSize = 1
    const halfWidth = this.gridSystem.width / 2
    const halfHeight = this.gridSystem.height / 2

    // Create vertical lines
    for (let x = -halfWidth; x <= halfWidth; x += gridSize) {
      const line = MeshBuilder.CreateLines('gridLineV', {
        points: [
          new Vector3(x, 0.01, -halfHeight),
          new Vector3(x, 0.01, halfHeight)
        ]
      }, this.scene)
      line.color = new Color3(0.2, 0.3, 0.1)
      line.alpha = 0.3
    }

    // Create horizontal lines
    for (let z = -halfHeight; z <= halfHeight; z += gridSize) {
      const line = MeshBuilder.CreateLines('gridLineH', {
        points: [
          new Vector3(-halfWidth, 0.01, z),
          new Vector3(halfWidth, 0.01, z)
        ]
      }, this.scene)
      line.color = new Color3(0.2, 0.3, 0.1)
      line.alpha = 0.3
    }
  }

  private setupEventHandlers(): void {
    // Mouse/touch input handling
    this.scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          this.handlePointerDown(pointerInfo)
          break
        case PointerEventTypes.POINTERUP:
          this.handlePointerUp(pointerInfo)
          break
      }
    })

    // Keyboard input
    this.inputManager.onArrowKey = (direction: string) => {
      this.cameraController.handleArrowKey(direction)
    }

    this.inputManager.onMouseWheel = (delta: number) => {
      this.cameraController.handleMouseWheel(delta)
    }
  }

  private handlePointerDown(pointerInfo: PointerInfo): void {
    if (!pointerInfo.pickInfo) return

    const pickInfo = pointerInfo.pickInfo
    
    if (pointerInfo.event.button === 0) { // Left click
      this.handleLeftClick(pickInfo)
    } else if (pointerInfo.event.button === 2) { // Right click
      this.handleRightClick(pickInfo, pointerInfo.event)
    }
  }

  private handlePointerUp(_pointerInfo: PointerInfo): void {
    // Handle touch end, long press, etc.
  }

  private handleLeftClick(pickInfo: PickingInfo): void {
    if (pickInfo.hit && pickInfo.pickedPoint) {
      // Convert world position to grid position
      const worldPos = pickInfo.pickedPoint
      const gridPos = this.gridSystem.worldToGrid(worldPos.x, worldPos.z)
      
      if (this.gridSystem.isValidPosition(gridPos)) {
        // Move player to clicked position
        this.playerController.moveToPosition(gridPos)
        
        // Show click marker
        this.showClickMarker(worldPos)
      }
    }
  }

  private handleRightClick(pickInfo: PickingInfo, event: any): void {
    event.preventDefault()
    
    if (pickInfo.hit && pickInfo.pickedMesh) {
      const mesh = pickInfo.pickedMesh
      const entity = this.entityManager.getEntityByMesh(mesh)
      
      if (entity) {
        // Show context menu for entity
        const screenPos: Vector2 = {
          x: event.clientX,
          y: event.clientY
        }
        
        const actions = ['examine']
        if (entity.linkUrl) {
          actions.push(entity.type === 'npc' ? 'talk' : 'open')
        }
        actions.push('move')
        
        const contextData: ContextMenuData = {
          entityId: entity.id,
          entityName: entity.name,
          position: screenPos,
          actions
        }
        
        if (this.onContextMenu) {
          this.onContextMenu(contextData)
        }
      }
    }
  }

  private showClickMarker(position: Vector3): void {
    // Remove existing marker
    const existingMarker = this.scene.getMeshByName('clickMarker')
    if (existingMarker) {
      existingMarker.dispose()
    }

    // Create new click marker
    const marker = MeshBuilder.CreateSphere('clickMarker', { diameter: 0.2 }, this.scene)
    marker.position = new Vector3(position.x, 0.1, position.z)
    
    const markerMaterial = new StandardMaterial('markerMaterial', this.scene)
    markerMaterial.diffuseColor = new Color3(1, 1, 0) // Yellow
    markerMaterial.emissiveColor = new Color3(0.3, 0.3, 0)
    marker.material = markerMaterial

    // Animate and remove marker after 1 second
    setTimeout(() => {
      if (marker && !marker.isDisposed()) {
        marker.dispose()
      }
    }, 1000)
  }

  private update(): void {
    this.playerController.update()
    this.cameraController.update()
  }

  public handleContextAction(entityId: string, action: string): void {
    const entity = this.entityManager.getEntityById(entityId)
    if (!entity) return

    switch (action) {
      case 'move':
        // Find adjacent position to entity
        const adjacentPos = this.gridSystem.findAdjacentPosition(entity.position)
        if (adjacentPos) {
          this.playerController.moveToPosition(adjacentPos)
        }
        break
        
      case 'examine':
        // Show examine text (could be a toast or modal)
        console.log(`Examining ${entity.name}: ${entity.examineText}`)
        break
        
      case 'talk':
      case 'open':
        if (entity.linkUrl && this.onLinkClick) {
          const linkData: LinkData = {
            title: entity.linkTitle || entity.name,
            description: entity.linkDescription || entity.description,
            url: entity.linkUrl,
            entityName: entity.name
          }
          this.onLinkClick(linkData)
        }
        break
    }
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings
    this.cameraController.setInvertCamera(settings.invertCamera)
    this.applyQualitySettings()
  }

  private applyQualitySettings(): void {
    switch (this.settings.quality) {
      case 'low':
        this.engine.setHardwareScalingLevel(2)
        this.scene.skipPointerMovePicking = true
        break
      case 'medium':
        this.engine.setHardwareScalingLevel(1.5)
        this.scene.skipPointerMovePicking = false
        break
      case 'high':
        this.engine.setHardwareScalingLevel(1)
        this.scene.skipPointerMovePicking = false
        break
    }
  }

  public dispose(): void {
    this.inputManager.dispose()
    this.engine.dispose()
  }
}