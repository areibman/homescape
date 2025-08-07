export type GridCoord = { x: number, y: number }

export interface GridConfig {
  width: number
  height: number
  blocked: Set<string>
  allowDiagonals?: boolean
}

export function keyOf(x: number, y: number) { return `${x},${y}` }

export function inBounds(cfg: GridConfig, x: number, y: number) {
  return x >= 0 && y >= 0 && x < cfg.width && y < cfg.height
}

function heuristic(a: GridCoord, b: GridCoord) {
  const dx = Math.abs(a.x - b.x)
  const dy = Math.abs(a.y - b.y)
  return dx + dy
}

export function neighbors(cfg: GridConfig, x: number, y: number): GridCoord[] {
  const list: GridCoord[] = []
  const dirs4 = [ [1,0], [-1,0], [0,1], [0,-1] ]
  for (const [dx,dy] of dirs4) {
    const nx = x + dx, ny = y + dy
    if (!inBounds(cfg, nx, ny)) continue
    if (cfg.blocked.has(keyOf(nx, ny))) continue
    list.push({ x: nx, y: ny })
  }
  if (cfg.allowDiagonals) {
    const diag = [ [1,1], [1,-1], [-1,1], [-1,-1] ]
    for (const [dx,dy] of diag) {
      const nx = x + dx, ny = y + dy
      if (!inBounds(cfg, nx, ny)) continue
      if (cfg.blocked.has(keyOf(nx, ny))) continue
      list.push({ x: nx, y: ny })
    }
  }
  return list
}

export function aStar(cfg: GridConfig, start: GridCoord, goal: GridCoord): GridCoord[] | null {
  const open = new Set<string>()
  const cameFrom = new Map<string, string>()
  const g = new Map<string, number>()
  const f = new Map<string, number>()

  const sKey = keyOf(start.x, start.y)
  const gKey = keyOf(goal.x, goal.y)

  open.add(sKey)
  g.set(sKey, 0)
  f.set(sKey, heuristic(start, goal))

  function lowestF(): string | null {
    let best: string | null = null
    let bestScore = Infinity
    for (const k of open) {
      const score = f.get(k) ?? Infinity
      if (score < bestScore) { best = k; bestScore = score }
    }
    return best
  }

  while (open.size) {
    const current = lowestF()
    if (!current) break
    if (current === gKey) {
      // reconstruct
      const path: GridCoord[] = []
      let ck: string | undefined = current
      while (ck) {
        const [cx, cy] = ck.split(',').map(Number)
        path.push({ x: cx, y: cy })
        ck = cameFrom.get(ck)
      }
      path.reverse()
      return path
    }
    open.delete(current)
    const [cx, cy] = current.split(',').map(Number)
    const currentG = g.get(current) ?? Infinity
    for (const n of neighbors(cfg, cx, cy)) {
      const nk = keyOf(n.x, n.y)
      const tentativeG = currentG + 1
      if (tentativeG < (g.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current)
        g.set(nk, tentativeG)
        f.set(nk, tentativeG + heuristic(n, goal))
        if (!open.has(nk)) open.add(nk)
      }
    }
  }

  return null
}

export function findAdjacentWalkable(cfg: GridConfig, target: GridCoord): GridCoord | null {
  const ns = neighbors(cfg, target.x, target.y)
  return ns[0] ?? null
}