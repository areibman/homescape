import type { PathfindingNode, GridCell } from '../types/game';

export class Pathfinding {
  private grid: GridCell[][];
  private gridSize: number;

  constructor(gridSize: number = 10) {
    this.gridSize = gridSize;
    this.grid = this.initializeGrid();
  }

  private initializeGrid(): GridCell[][] {
    const grid: GridCell[][] = [];
    for (let x = 0; x < this.gridSize; x++) {
      grid[x] = [];
      for (let y = 0; y < this.gridSize; y++) {
        grid[x][y] = {
          x,
          y,
          walkable: true,
          occupied: false
        };
      }
    }
    return grid;
  }

  public setOccupied(x: number, y: number, occupied: boolean): void {
    if (this.isValidPosition(x, y)) {
      this.grid[x][y].occupied = occupied;
      this.grid[x][y].walkable = !occupied;
    }
  }

  public setWalkable(x: number, y: number, walkable: boolean): void {
    if (this.isValidPosition(x, y)) {
      this.grid[x][y].walkable = walkable;
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  public findPath(startX: number, startY: number, endX: number, endY: number): [number, number][] {
    if (!this.isValidPosition(startX, startY) || !this.isValidPosition(endX, endY)) {
      return [];
    }

    if (!this.grid[startX][startY].walkable || !this.grid[endX][endY].walkable) {
      return [];
    }

    const openSet: PathfindingNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathfindingNode = {
      x: startX,
      y: startY,
      walkable: true,
      gCost: 0,
      hCost: this.calculateHeuristic(startX, startY, endX, endY),
      parent: null
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest fCost
      let currentNode = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        const node = openSet[i];
        if (node.gCost + node.hCost < currentNode.gCost + currentNode.hCost) {
          currentNode = node;
          currentIndex = i;
        }
      }

      // Move current node from open to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(`${currentNode.x},${currentNode.y}`);

      // Check if we reached the target
      if (currentNode.x === endX && currentNode.y === endY) {
        return this.reconstructPath(currentNode);
      }

      // Check neighbors
      const neighbors = this.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }

        const newGCost = currentNode.gCost + this.getDistance(currentNode, neighbor);
        const existingNeighbor = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existingNeighbor) {
          neighbor.gCost = newGCost;
          neighbor.hCost = this.calculateHeuristic(neighbor.x, neighbor.y, endX, endY);
          neighbor.parent = currentNode;
          openSet.push(neighbor);
        } else if (newGCost < existingNeighbor.gCost) {
          existingNeighbor.gCost = newGCost;
          existingNeighbor.parent = currentNode;
        }
      }
    }

    return []; // No path found
  }

  private getNeighbors(node: PathfindingNode): PathfindingNode[] {
    const neighbors: PathfindingNode[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // 4-directional
      [-1, -1], [-1, 1], [1, -1], [1, 1] // 8-directional
    ];

    for (const [dx, dy] of directions) {
      const newX = node.x + dx;
      const newY = node.y + dy;

      if (this.isValidPosition(newX, newY) && this.grid[newX][newY].walkable) {
        neighbors.push({
          x: newX,
          y: newY,
          walkable: true,
          gCost: 0,
          hCost: 0,
          parent: null
        });
      }
    }

    return neighbors;
  }

  private calculateHeuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private getDistance(nodeA: PathfindingNode, nodeB: PathfindingNode): number {
    const dx = Math.abs(nodeA.x - nodeB.x);
    const dy = Math.abs(nodeA.y - nodeB.y);
    
    // Diagonal movement costs more
    if (dx === 1 && dy === 1) {
      return 1.4; // √2
    }
    return 1;
  }

  private reconstructPath(endNode: PathfindingNode): [number, number][] {
    const path: [number, number][] = [];
    let currentNode: PathfindingNode | null = endNode;

    while (currentNode !== null) {
      path.unshift([currentNode.x, currentNode.y]);
      currentNode = currentNode.parent;
    }

    return path;
  }

  public getGrid(): GridCell[][] {
    return this.grid;
  }

  public getGridSize(): number {
    return this.gridSize;
  }
}