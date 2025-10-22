import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const cls = document.documentElement.classList
    if (dark) cls.add('dark'); else cls.remove('dark')
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved) setDark(saved === 'dark')
    } catch {}
  }, [])

  return (
    <button
      type="button"
      onClick={() => setDark(v => !v)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.64 13A9 9 0 1 1 11 2.36 7 7 0 0 0 21.64 13z"/></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zm10.48 0l1.79-1.79 1.79 1.79-1.79 1.79-1.79-1.79zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.8 1.79-1.79-1.79 1.79-1.79 1.8 1.79zm10.48 0l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>
      )}
      <span className="text-sm">{dark ? 'Sombre' : 'Clair'}</span>
    </button>
  )
}
