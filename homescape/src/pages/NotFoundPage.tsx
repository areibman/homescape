import React from 'react'
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist in this realm.</p>
        <div className="links">
          <Link to="/" className="home-link">Return to Landing</Link>
          <Link to="/boring" className="boring-link">Go to Boring Page</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage