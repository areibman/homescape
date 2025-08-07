import { ArcRotateCamera, Vector3 } from '@babylonjs/core'

export class CameraController {
  private camera: ArcRotateCamera
  private invertCamera: boolean
  private rotationSpeed: number = 0.02
  private zoomSpeed: number = 0.5
  private minRadius: number = 8
  private maxRadius: number = 25
  private minBeta: number = 0.1
  private maxBeta: number = Math.PI / 2 - 0.1

  constructor(camera: ArcRotateCamera, invertCamera: boolean = false) {
    this.camera = camera
    this.invertCamera = invertCamera
    
    // Set initial camera constraints
    this.camera.lowerRadiusLimit = this.minRadius
    this.camera.upperRadiusLimit = this.maxRadius
    this.camera.lowerBetaLimit = this.minBeta
    this.camera.upperBetaLimit = this.maxBeta
    
    // Disable default camera controls to handle them manually
    this.camera.attachControl(this.camera.getScene()!.getEngine().getRenderingCanvas()!, false)
  }

  public handleArrowKey(direction: string): void {
    const invertMultiplier = this.invertCamera ? -1 : 1
    
    switch (direction) {
      case 'left':
        this.camera.alpha -= this.rotationSpeed * invertMultiplier
        break
      case 'right':
        this.camera.alpha += this.rotationSpeed * invertMultiplier
        break
      case 'up':
        // Zoom in or move camera up
        this.camera.radius = Math.max(this.minRadius, this.camera.radius - this.zoomSpeed)
        break
      case 'down':
        // Zoom out or move camera down
        this.camera.radius = Math.min(this.maxRadius, this.camera.radius + this.zoomSpeed)
        break
    }
  }

  public handleMouseWheel(delta: number): void {
    const zoomAmount = delta > 0 ? -this.zoomSpeed : this.zoomSpeed
    this.camera.radius = Math.max(
      this.minRadius,
      Math.min(this.maxRadius, this.camera.radius + zoomAmount)
    )
  }

  public setTarget(target: Vector3): void {
    this.camera.setTarget(target)
  }

  public getTarget(): Vector3 {
    return this.camera.getTarget()
  }

  public setInvertCamera(invert: boolean): void {
    this.invertCamera = invert
  }

  public update(): void {
    // Any per-frame camera updates can go here
    // For now, the camera updates automatically through Babylon.js
  }

  public focusOnPosition(position: Vector3, smooth: boolean = true): void {
    if (smooth) {
      // Smooth camera movement to new target
      const currentTarget = this.camera.getTarget()
      const distance = Vector3.Distance(currentTarget, position)
      
      if (distance > 0.1) {
        const lerpFactor = 0.05 // Adjust for smoother/faster movement
        const newTarget = Vector3.Lerp(currentTarget, position, lerpFactor)
        this.camera.setTarget(newTarget)
      }
    } else {
      this.camera.setTarget(position)
    }
  }

  public resetToDefault(): void {
    this.camera.alpha = -Math.PI / 2
    this.camera.beta = Math.PI / 3
    this.camera.radius = 15
  }

  public getCamera(): ArcRotateCamera {
    return this.camera
  }
}