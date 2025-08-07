import { useEffect, useRef, useState } from 'react'
import { createHomescapeScene, type SceneController, type SceneEntity } from '../scene/HomescapeScene'
import links from '../scene/entities.json'
import { useSettingsStore } from '../state/settings'
import { ContextMenu, type ContextMenuAction } from '../ui/ContextMenu'
import { LinkModal } from '../ui/LinkModal'
import './play.css'

export default function Play() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const controllerRef = useRef<SceneController | null>(null)
  const [contextPos, setContextPos] = useState<{x: number, y: number} | null>(null)
  const [contextTarget, setContextTarget] = useState<SceneEntity | null>(null)
  const [linkTarget, setLinkTarget] = useState<SceneEntity | null>(null)
  const settings = useSettingsStore()

  useEffect(() => {
    if (!canvasRef.current) return

    const entityDefs = links as unknown as SceneEntity[]

    const { controller, dispose } = createHomescapeScene({
      canvas: canvasRef.current,
      entities: entityDefs,
      quality: settings.quality,
      invertedCamera: settings.invertCamera,
      onContextMenu: (entity, screenPos) => {
        setContextTarget(entity)
        setContextPos(screenPos)
      },
      onOpenLink: (entity) => setLinkTarget(entity),
      onCloseUI: () => {
        setContextTarget(null)
        setContextPos(null)
        setLinkTarget(null)
      }
    })
    controllerRef.current = controller
    return () => dispose()
  }, [settings.quality, settings.invertCamera])

  const handleAction = (action: ContextMenuAction) => {
    const target = contextTarget
    if (!target || !controllerRef.current) return
    if (action === 'move') {
      controllerRef.current.moveAdjacentTo(target)
    } else if (action === 'examine') {
      setLinkTarget({ ...target, linkUrl: undefined })
    } else if (action === 'open') {
      if (target.linkUrl) setLinkTarget(target)
    }
    setContextPos(null)
  }

  return (
    <div className="play-root">
      <canvas ref={canvasRef} className="viewport" aria-label="3D scene" />

      <div className="hud top-left">Homescape Town Square</div>

      <div className="hud top-right">
        <label className="setting">
          <span>Quality</span>
          <select value={settings.quality} onChange={e => settings.setQuality(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="setting">
          <span>Audio</span>
          <input type="checkbox" checked={settings.audioEnabled} onChange={e => settings.setAudioEnabled(e.target.checked)} />
        </label>
        <label className="setting">
          <span>Invert camera</span>
          <input type="checkbox" checked={settings.invertCamera} onChange={e => settings.setInvertCamera(e.target.checked)} />
        </label>
        <label className="setting">
          <span>Analytics</span>
          <input type="checkbox" checked={settings.analyticsEnabled} onChange={e => settings.setAnalyticsEnabled(e.target.checked)} />
        </label>
      </div>

      <div className="hud bottom">Left-click to move. Right-click for options. Arrow keys rotate/zoom.</div>

      {contextTarget && contextPos && (
        <ContextMenu
          x={contextPos.x}
          y={contextPos.y}
          onClose={() => setContextPos(null)}
          actions={['move', 'examine', ...(contextTarget.linkUrl ? ['open'] as const : [])]}
          label={contextTarget.label}
          onSelect={handleAction}
        />
      )}

      {linkTarget && (
        <LinkModal
          title={linkTarget.label}
          description={linkTarget.examine || ''}
          href={linkTarget.linkUrl}
          onClose={() => setLinkTarget(null)}
        />
      )}
    </div>
  )
}