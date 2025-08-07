import { Scene } from '@babylonjs/core'

export class InputManager {
  private canvas: HTMLCanvasElement
  // private scene: Scene
  private keyStates: { [key: string]: boolean } = {}
  
  // Event callbacks
  public onArrowKey: ((direction: string) => void) | null = null
  public onMouseWheel: ((delta: number) => void) | null = null

  constructor(canvas: HTMLCanvasElement, _scene: Scene) {
    this.canvas = canvas
    // this.scene = scene
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    // Mouse wheel events
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this))

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })

    // Focus canvas for keyboard events
    this.canvas.addEventListener('click', () => {
      this.canvas.focus()
    })

    // Make canvas focusable
    this.canvas.tabIndex = 0
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keyStates[event.code] = true

    // Handle arrow keys
    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault()
        if (this.onArrowKey) this.onArrowKey('left')
        break
      case 'ArrowRight':
        event.preventDefault()
        if (this.onArrowKey) this.onArrowKey('right')
        break
      case 'ArrowUp':
        event.preventDefault()
        if (this.onArrowKey) this.onArrowKey('up')
        break
      case 'ArrowDown':
        event.preventDefault()
        if (this.onArrowKey) this.onArrowKey('down')
        break
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keyStates[event.code] = false
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault()
    
    if (this.onMouseWheel) {
      this.onMouseWheel(event.deltaY)
    }
  }

  public isKeyPressed(keyCode: string): boolean {
    return this.keyStates[keyCode] || false
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this))
  }
}