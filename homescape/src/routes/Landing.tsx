import { Link } from 'react-router-dom'
import './landing.css'

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="login-panel" role="main" aria-labelledby="landing-title">
        <h1 id="landing-title" className="title">Homescape</h1>
        <p className="subtitle">A tiny nostalgic landing</p>
        <div className="buttons">
          <Link className="btn primary" to="/play" aria-label="Play Now">Play Now</Link>
          <Link className="btn" to="/boring" aria-label="Boring version">Boring</Link>
        </div>
        <p className="hint">No accounts. No tracking by default. All original assets.</p>
      </div>
    </div>
  )
}