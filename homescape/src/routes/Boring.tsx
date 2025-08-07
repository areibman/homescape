import links from '../scene/entities.json'

export default function Boring() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <h1>Homescape — Plain Links</h1>
      <p>This page is a lightweight, accessible list of the same destinations available in the 3D scene.</p>
      <nav aria-label="Primary links">
        <ul>
          {links.filter(l => l.linkUrl).map(link => (
            <li key={link.id}>
              <a href={link.linkUrl!} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
              {link.examine && <p style={{ margin: '4px 0 12px', color: '#555' }}>{link.examine}</p>}
            </li>
          ))}
        </ul>
      </nav>
      <p>
        <a href="/">Back to landing</a>
      </p>
    </main>
  )
}