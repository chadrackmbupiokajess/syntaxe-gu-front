import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'

export default function Layout({ children }) {
  const dispatch = useDispatch()
  const { me } = useSelector(s => s.auth)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 4.9v9.8L12 22l-9-5.3V6.9L12 2zm0 2.2L5 7v7l7 4.1L19 14V7l-7-2.8z"/></svg>
              <span className="font-semibold">Université</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <Link to="/" className="hover:text-brand-600">Accueil</Link>
              <Link to="/assistant" className="hover:text-brand-600">Assistant</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {me && <span className="text-sm text-slate-500 dark:text-slate-400">{me.username}</span>}
            <ThemeToggle />
            <button className="btn btn-sm" onClick={() => dispatch(logout())}>Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
