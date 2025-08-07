import React from 'react'
import { Link } from 'react-router-dom'
import './BoringPage.css'

const BoringPage: React.FC = () => {
  const links = [
    {
      title: 'Blog',
      url: 'https://example.com/blog',
      description: 'My thoughts and writings'
    },
    {
      title: 'Photos',
      url: 'https://example.com/photos',
      description: 'Photography and visual memories'
    },
    {
      title: 'Projects',
      url: 'https://github.com',
      description: 'Code repositories and work samples'
    },
    {
      title: 'Resume',
      url: 'https://example.com/resume.pdf',
      description: 'Professional experience and skills'
    },
    {
      title: 'Contact',
      url: 'mailto:hello@example.com',
      description: 'Get in touch with me'
    }
  ]

  return (
    <div className="boring-page">
      <div className="boring-container">
        <header>
          <h1>Homescape</h1>
          <p>A simple, accessible personal page</p>
        </header>

        <nav aria-label="Main navigation">
          <Link to="/" className="back-link">← Back to Landing</Link>
        </nav>

        <main>
          <section>
            <h2>About</h2>
            <p>
              Welcome to my personal corner of the internet. This is the "boring" version 
              of my site - a simple, fast-loading, and accessible page with all the same 
              links you'd find in the interactive 3D version.
            </p>
          </section>

          <section>
            <h2>Links</h2>
            <ul className="links-list">
              {links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    <strong>{link.title}</strong>
                    <span className="link-description">{link.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Why This Page Exists</h2>
            <p>
              This minimal version ensures everyone can access my content regardless of:
            </p>
            <ul>
              <li>Device capabilities or internet speed</li>
              <li>Accessibility needs</li>
              <li>Browser support for WebGL</li>
              <li>Personal preference for simple interfaces</li>
            </ul>
          </section>
        </main>

        <footer>
          <p>
            Want the interactive experience? <Link to="/play">Try the 3D version</Link>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default BoringPage