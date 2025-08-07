export function LinkModal({ title, description, href, onClose }:{
  title: string
  description: string
  href?: string
  onClose: () => void
}) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 30
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(520px, 92vw)', background: '#151821', border: '1px solid #394155', borderRadius: 10,
        color: '#e8edf7', padding: 16, boxShadow: '0 14px 30px rgba(0,0,0,0.5)'
      }}>
        <h2 id="modal-title" style={{ marginTop: 0 }}>{title}</h2>
        {description && <p style={{ color: '#aab4cc' }}>{description}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', color: '#e8edf7', border: '1px solid #3a4256', padding: '8px 12px', borderRadius: 8 }}>Close</button>
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ background: '#efc969', color: '#1d1710', border: '1px solid #b4872f', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Open</a>
          )}
        </div>
      </div>
    </div>
  )
}