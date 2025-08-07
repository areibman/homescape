import * as BABYLON from 'babylonjs';
import { Entity, GameSettings, GridPosition } from '../types';

export default class InputController {
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  private canvas: HTMLCanvasElement;
  private settings: GameSettings;
  private ground: BABYLON.Mesh | null = null;
  
  // Touch/mobile support
  private touchStartTime: number = 0;
  private touchStartPos: { x: number; y: number } | null = null;
  private longPressThreshold: number = 400; // ms
  private longPressTimer: number | null = null;
  
  // Camera control
  private cameraRotateSpeed: number = 0.02;
  private cameraZoomSpeed: number = 0.5;
  
  // Event callbacks
  public onGroundClick?: (position: GridPosition) => void;
  public onContextMenu?: (x: number, y: number, pickedMesh: BABYLON.Mesh | null) => void;
  public onEntityClick?: (entity: Entity) => void;
  public onHover?: (mesh: BABYLON.Mesh | null) => void;

  constructor(
    scene: BABYLON.Scene,
    camera: BABYLON.ArcRotateCamera,
    canvas: HTMLCanvasElement,
    settings: GameSettings
  ) {
    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas;
    this.settings = settings;
    
    this.setupInputHandlers();
  }

  public setGround(ground: BABYLON.Mesh): void {
    this.ground = ground;
  }

  private setupInputHandlers(): void {
    // Mouse events
    this.setupMouseEvents();
    
    // Keyboard events
    this.setupKeyboardEvents();
    
    // Touch events for mobile
    this.setupTouchEvents();
    
    // Prevent default context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupMouseEvents(): void {
    // Left click
    this.scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          if (pointerInfo.event.button === 0) { // Left click
            this.handleLeftClick(pointerInfo);
          }
          break;
          
        case BABYLON.PointerEventTypes.POINTERUP:
          if (pointerInfo.event.button === 2) { // Right click
            this.handleRightClick(pointerInfo);
          }
          break;
          
        case BABYLON.PointerEventTypes.POINTERMOVE:
          this.handleMouseMove(pointerInfo);
          break;
      }
    });
    
    // Mouse wheel for zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      this.camera.radius += delta * this.cameraZoomSpeed;
      this.camera.radius = Math.max(
        this.camera.lowerRadiusLimit!,
        Math.min(this.camera.upperRadiusLimit!, this.camera.radius)
      );
    });
  }

  private setupKeyboardEvents(): void {
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    
    // Arrow keys for camera rotation
    const keys = {
      left: false,
      right: false,
      up: false,
      down: false
    };
    
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          keys.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
          keys.right = true;
          e.preventDefault();
          break;
        case 'ArrowUp':
          keys.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
          keys.down = true;
          e.preventDefault();
          break;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'ArrowRight':
          keys.right = false;
          break;
        case 'ArrowUp':
          keys.up = false;
          break;
        case 'ArrowDown':
          keys.down = false;
          break;
      }
    });
    
    // Update camera based on key states
    this.scene.registerBeforeRender(() => {
      const invertMultiplier = this.settings.invertCamera ? -1 : 1;
      
      if (keys.left) {
        this.camera.alpha -= this.cameraRotateSpeed * invertMultiplier;
      }
      if (keys.right) {
        this.camera.alpha += this.cameraRotateSpeed * invertMultiplier;
      }
      if (keys.up) {
        this.camera.beta -= this.cameraRotateSpeed * invertMultiplier;
        this.camera.beta = Math.max(
          this.camera.lowerBetaLimit!,
          this.camera.beta
        );
      }
      if (keys.down) {
        this.camera.beta += this.cameraRotateSpeed * invertMultiplier;
        this.camera.beta = Math.min(
          this.camera.upperBetaLimit!,
          this.camera.beta
        );
      }
    });
  }

  private setupTouchEvents(): void {
    let lastTouchDistance = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      
      if (e.touches.length === 1) {
        // Single touch - start long press timer
        const touch = e.touches[0];
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        // Start long press timer
        this.longPressTimer = window.setTimeout(() => {
          if (this.touchStartPos) {
            this.handleLongPress(this.touchStartPos.x, this.touchStartPos.y);
          }
        }, this.longPressThreshold);
        
      } else if (e.touches.length === 2) {
        // Two finger touch - prepare for pinch/rotate
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        
        lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      // Cancel long press if moving
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      
      if (e.touches.length === 2) {
        // Two finger gesture - pinch zoom and rotate
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        // Pinch zoom
        if (lastTouchDistance > 0) {
          const scale = distance / lastTouchDistance;
          this.camera.radius /= scale;
          this.camera.radius = Math.max(
            this.camera.lowerRadiusLimit!,
            Math.min(this.camera.upperRadiusLimit!, this.camera.radius)
          );
        }
        
        // Rotate camera
        const deltaX = centerX - lastTouchX;
        const deltaY = centerY - lastTouchY;
        
        this.camera.alpha -= deltaX * 0.01;
        this.camera.beta += deltaY * 0.01;
        this.camera.beta = Math.max(
          this.camera.lowerBetaLimit!,
          Math.min(this.camera.upperBetaLimit!, this.camera.beta)
        );
        
        lastTouchDistance = distance;
        lastTouchX = centerX;
        lastTouchY = centerY;
      }
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      
      // Clear long press timer
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      
      // Check for tap (short touch)
      if (this.touchStartPos && Date.now() - this.touchStartTime < 300) {
        this.handleTap(this.touchStartPos.x, this.touchStartPos.y);
      }
      
      this.touchStartPos = null;
      lastTouchDistance = 0;
    });
  }

  private handleLeftClick(pointerInfo: BABYLON.PointerInfo): void {
    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY
    );
    
    if (pickResult && pickResult.hit && pickResult.pickedMesh) {
      if (pickResult.pickedMesh === this.ground) {
        // Click on ground - move player
        const gridPos = this.worldToGrid(pickResult.pickedPoint!);
        if (this.onGroundClick) {
          this.onGroundClick(gridPos);
        }
        
        // Show click marker
        this.showClickMarker(pickResult.pickedPoint!);
      }
    }
  }

  private handleRightClick(pointerInfo: BABYLON.PointerInfo): void {
    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY
    );
    
    if (this.onContextMenu) {
      this.onContextMenu(
        pointerInfo.event.clientX,
        pointerInfo.event.clientY,
        pickResult?.pickedMesh || null
      );
    }
  }

  private handleMouseMove(pointerInfo: BABYLON.PointerInfo): void {
    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY
    );
    
    if (this.onHover) {
      this.onHover(pickResult?.pickedMesh || null);
    }
  }

  private handleTap(x: number, y: number): void {
    // Convert screen coordinates to scene coordinates
    const pickResult = this.scene.pick(x, y);
    
    if (pickResult && pickResult.hit && pickResult.pickedMesh) {
      if (pickResult.pickedMesh === this.ground) {
        // Tap on ground - move player
        const gridPos = this.worldToGrid(pickResult.pickedPoint!);
        if (this.onGroundClick) {
          this.onGroundClick(gridPos);
        }
        
        // Show click marker
        this.showClickMarker(pickResult.pickedPoint!);
      }
    }
  }

  private handleLongPress(x: number, y: number): void {
    // Long press acts as right click on mobile
    const pickResult = this.scene.pick(x, y);
    
    if (this.onContextMenu) {
      this.onContextMenu(
        x,
        y,
        pickResult?.pickedMesh || null
      );
    }
  }

  private worldToGrid(worldPos: BABYLON.Vector3): GridPosition {
    // Convert world position to grid position
    const x = Math.round(worldPos.x + 6);
    const z = Math.round(worldPos.z + 6);
    
    // Clamp to grid bounds
    return {
      x: Math.max(0, Math.min(11, x)),
      z: Math.max(0, Math.min(11, z))
    };
  }

  private showClickMarker(position: BABYLON.Vector3): void {
    // Create a temporary click marker
    const marker = BABYLON.MeshBuilder.CreateDisc(
      'clickMarker',
      { radius: 0.3, tessellation: 16 },
      this.scene
    );
    
    marker.position = position.clone();
    marker.position.y = 0.01; // Just above ground
    marker.rotation.x = Math.PI / 2; // Face up
    
    const markerMat = new BABYLON.StandardMaterial('markerMat', this.scene);
    markerMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.2);
    markerMat.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.1);
    markerMat.alpha = 0.6;
    marker.material = markerMat;
    
    // Animate and remove
    let alpha = 0.6;
    let scale = 1;
    
    const animation = this.scene.registerBeforeRender(() => {
      alpha -= 0.02;
      scale += 0.02;
      
      if (alpha <= 0) {
        marker.dispose();
        this.scene.unregisterBeforeRender(animation);
      } else {
        markerMat.alpha = alpha;
        marker.scaling = new BABYLON.Vector3(scale, 1, scale);
      }
    });
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
  }

  public dispose(): void {
    // Clean up event listeners
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }
}