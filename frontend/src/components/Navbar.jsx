import React from 'react'

export default function Navbar({ onToggleTheme, theme, onHelp }) {
  return (
    <header className="navbar" role="banner">
      <div className="nav-content">
        <div className="brand">
          <div className="logo" aria-hidden>🚀</div>
          <div className="brand-text">
            <div className="brand-title">ACE Orbit</div>
            <div className="brand-sub">Aditya College of Engineering</div>
          </div>
        </div>

        <nav className="nav-actions" aria-label="Primary">
          <button className="btn ghost" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
          </button>
          <button className="btn link" onClick={onHelp} aria-haspopup="dialog" aria-controls="help-modal">Help</button>
        </nav>
      </div>
    </header>
  )
}