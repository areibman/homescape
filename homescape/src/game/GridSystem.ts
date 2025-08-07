import type { GridPosition, PathNode } from '../types/GameTypes'

export class GridSystem {
  public readonly width: number
  public readonly height: number
  private grid: boolean[][] = [] // true = walkable, false = blocked
  
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.initializeGrid()
  }

  private initializeGrid(): void {
    this.grid = []
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = []
      for (let z = 0; z < this.height; z++) {
        this.grid[x][z] = true // All tiles walkable by default
      }
    }
  }

  public worldToGrid(worldX: number, worldZ: number): GridPosition {
    // Convert world coordinates to grid coordinates
    // World center is at (0,0), grid center is at (width/2, height/2)
    const gridX = Math.round(worldX + this.width / 2)
    const gridZ = Math.round(worldZ + this.height / 2)
    
    return { x: gridX, z: gridZ }
  }

  public gridToWorld(gridX: number, gridZ: number): { x: number, z: number } {
    // Convert grid coordinates to world coordinates
    const worldX = gridX - this.width / 2
    const worldZ = gridZ - this.height / 2
    
    return { x: worldX, z: worldZ }
  }

  public isValidPosition(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.width && 
           pos.z >= 0 && pos.z < this.height &&
           this.grid[pos.x][pos.z]
  }

  public setWalkable(pos: GridPosition, walkable: boolean): void {
    if (pos.x >= 0 && pos.x < this.width && pos.z >= 0 && pos.z < this.height) {
      this.grid[pos.x][pos.z] = walkable
    }
  }

  public findPath(start: GridPosition, end: GridPosition): GridPosition[] {
    if (!this.isValidPosition(start) || !this.isValidPosition(end)) {
      return []
    }

    if (start.x === end.x && start.z === end.z) {
      return [start]
    }

    return this.aStar(start, end)
  }

  private aStar(start: GridPosition, end: GridPosition): GridPosition[] {
    const openSet: PathNode[] = []
    const closedSet: Set<string> = new Set()

    const startNode: PathNode = {
      x: start.x,
      z: start.z,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
      walkable: true
    }
    startNode.f = startNode.g + startNode.h

    openSet.push(startNode)

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i
        }
      }

      const current = openSet.splice(currentIndex, 1)[0]
      const currentKey = `${current.x},${current.z}`
      closedSet.add(currentKey)

      // Check if we reached the goal
      if (current.x === end.x && current.z === end.z) {
        return this.reconstructPath(current)
      }

      // Check neighbors
      const neighbors = this.getNeighbors(current)
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.z}`
        
        if (closedSet.has(neighborKey) || !this.isValidPosition(neighbor)) {
          continue
        }

        const tentativeG = current.g + 1 // Cost to move to neighbor

        let existingNeighbor = openSet.find(n => n.x === neighbor.x && n.z === neighbor.z)
        
        if (!existingNeighbor) {
          const neighborNode: PathNode = {
            x: neighbor.x,
            z: neighbor.z,
            g: tentativeG,
            h: this.heuristic(neighbor, end),
            f: 0,
            parent: current,
            walkable: true
          }
          neighborNode.f = neighborNode.g + neighborNode.h
          openSet.push(neighborNode)
        } else if (tentativeG < existingNeighbor.g) {
          existingNeighbor.g = tentativeG
          existingNeighbor.f = existingNeighbor.g + existingNeighbor.h
          existingNeighbor.parent = current
        }
      }
    }

    // No path found
    return []
  }

  private heuristic(a: GridPosition, b: GridPosition): number {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z)
  }

  private getNeighbors(pos: GridPosition): GridPosition[] {
    const neighbors: GridPosition[] = []
    
    // 4-directional movement (up, down, left, right)
    const directions = [
      { x: 0, z: 1 },  // North
      { x: 0, z: -1 }, // South
      { x: -1, z: 0 }, // West
      { x: 1, z: 0 }   // East
    ]

    for (const dir of directions) {
      neighbors.push({
        x: pos.x + dir.x,
        z: pos.z + dir.z
      })
    }

    return neighbors
  }

  private reconstructPath(endNode: PathNode): GridPosition[] {
    const path: GridPosition[] = []
    let current: PathNode | null = endNode

    while (current) {
      path.unshift({ x: current.x, z: current.z })
      current = current.parent
    }

    return path
  }

  public findAdjacentPosition(targetPos: GridPosition): GridPosition | null {
    const neighbors = this.getNeighbors(targetPos)
    
    for (const neighbor of neighbors) {
      if (this.isValidPosition(neighbor)) {
        return neighbor
      }
    }
    
    return null
  }

  public getRandomWalkablePosition(): GridPosition | null {
    const maxAttempts = 100
    
    for (let i = 0; i < maxAttempts; i++) {
      const pos: GridPosition = {
        x: Math.floor(Math.random() * this.width),
        z: Math.floor(Math.random() * this.height)
      }
      
      if (this.isValidPosition(pos)) {
        return pos
      }
    }
    
    // Fallback to center if no random position found
    const center: GridPosition = {
      x: Math.floor(this.width / 2),
      z: Math.floor(this.height / 2)
    }
    
    return this.isValidPosition(center) ? center : null
  }
}