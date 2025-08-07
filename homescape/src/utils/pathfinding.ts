import { GridPosition, PathNode } from '../types';

export class Pathfinding {
  private gridWidth: number;
  private gridHeight: number;
  private blockedCells: Set<string>;

  constructor(gridWidth: number, gridHeight: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.blockedCells = new Set();
  }

  private getCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  setBlocked(x: number, z: number, blocked: boolean) {
    const key = this.getCellKey(x, z);
    if (blocked) {
      this.blockedCells.add(key);
    } else {
      this.blockedCells.delete(key);
    }
  }

  isBlocked(x: number, z: number): boolean {
    if (x < 0 || x >= this.gridWidth || z < 0 || z >= this.gridHeight) {
      return true;
    }
    return this.blockedCells.has(this.getCellKey(x, z));
  }

  private getNeighbors(node: GridPosition): GridPosition[] {
    const neighbors: GridPosition[] = [];
    const directions = [
      { x: 0, z: -1 }, // North
      { x: 1, z: 0 },  // East
      { x: 0, z: 1 },  // South
      { x: -1, z: 0 }, // West
      // Diagonal movements (optional 8-direction)
      { x: 1, z: -1 }, // Northeast
      { x: 1, z: 1 },  // Southeast
      { x: -1, z: 1 }, // Southwest
      { x: -1, z: -1 } // Northwest
    ];

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newZ = node.z + dir.z;
      
      if (!this.isBlocked(newX, newZ)) {
        // For diagonal movement, check if both adjacent cells are free
        if (Math.abs(dir.x) + Math.abs(dir.z) === 2) {
          if (!this.isBlocked(node.x + dir.x, node.z) && 
              !this.isBlocked(node.x, node.z + dir.z)) {
            neighbors.push({ x: newX, z: newZ });
          }
        } else {
          neighbors.push({ x: newX, z: newZ });
        }
      }
    }

    return neighbors;
  }

  private heuristic(a: GridPosition, b: GridPosition): number {
    // Euclidean distance for smoother paths
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    return Math.sqrt(dx * dx + dz * dz);
  }

  findPath(start: GridPosition, goal: GridPosition): GridPosition[] | null {
    if (this.isBlocked(goal.x, goal.z)) {
      // Find nearest valid position to goal
      const nearestGoal = this.findNearestValidPosition(goal);
      if (!nearestGoal) return null;
      goal = nearestGoal;
    }

    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, PathNode>();

    const startNode: PathNode = {
      x: start.x,
      z: start.z,
      g: 0,
      h: this.heuristic(start, goal),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score
      let current = openSet[0];
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      // Remove current from openSet
      openSet.splice(currentIndex, 1);

      // Check if we reached the goal
      if (current.x === goal.x && current.z === goal.z) {
        return this.reconstructPath(current);
      }

      closedSet.add(this.getCellKey(current.x, current.z));

      // Check neighbors
      const neighbors = this.getNeighbors({ x: current.x, z: current.z });
      for (const neighbor of neighbors) {
        const neighborKey = this.getCellKey(neighbor.x, neighbor.z);
        
        if (closedSet.has(neighborKey)) continue;

        const isDiagonal = Math.abs(neighbor.x - current.x) + Math.abs(neighbor.z - current.z) === 2;
        const moveCost = isDiagonal ? Math.sqrt(2) : 1;
        const tentativeG = current.g + moveCost;

        let neighborNode = openSet.find(n => n.x === neighbor.x && n.z === neighbor.z);
        
        if (!neighborNode) {
          neighborNode = {
            x: neighbor.x,
            z: neighbor.z,
            g: tentativeG,
            h: this.heuristic(neighbor, goal),
            f: 0,
            parent: current
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
          neighborNode.g = tentativeG;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    return null; // No path found
  }

  private reconstructPath(node: PathNode): GridPosition[] {
    const path: GridPosition[] = [];
    let current: PathNode | null = node;
    
    while (current) {
      path.unshift({ x: current.x, z: current.z });
      current = current.parent;
    }
    
    return path;
  }

  private findNearestValidPosition(target: GridPosition): GridPosition | null {
    const maxRadius = 5;
    
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
            const x = target.x + dx;
            const z = target.z + dz;
            if (!this.isBlocked(x, z)) {
              return { x, z };
            }
          }
        }
      }
    }
    
    return null;
  }
}