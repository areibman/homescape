import { useEffect, useRef } from 'react'

export type ContextMenuAction = 'move' | 'examine' | 'open'

export function ContextMenu({ x, y, actions, label, onSelect, onClose }:{
  x: number
  y: number
  actions: readonly ContextMenuAction[]
  label: string
  onSelect: (action: ContextMenuAction) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [onClose])

  return (
    <div ref={ref} role="menu" aria-label={`Actions for ${label}`} style={{
      position: 'absolute', top: y, left: x, background: 'rgba(22,24,30,0.96)',
      border: '1px solid #3a4256', borderRadius: 8, padding: 8, color: '#e8edf7',
      minWidth: 160, zIndex: 20, boxShadow: '0 10px 22px rgba(0,0,0,0.5)'
    }}>
      <div style={{ padding: '4px 8px', color: '#aab4cc', fontSize: 12 }}>{label}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {actions.map(a => (
          <li key={a}>
            <button
              style={{
                width: '100%', textAlign: 'left', background: 'transparent', color: '#e8edf7',
                border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer'
              }}
              onClick={() => onSelect(a)}
            >
              {a === 'move' ? 'Move' : a === 'examine' ? 'Examine' : 'Talk / Open'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}