import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginThunk, fetchMe } from '../store/authSlice'
import { Navigate, useLocation } from 'react-router-dom'

export default function Login() {
  const dispatch = useDispatch()
  const { access, status } = useSelector(s => s.auth)
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin1234')

  if (access) return <Navigate to={location.state?.from?.pathname || "/"} replace />

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="card w-[380px] p-6">
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 text-brand-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 4.9v9.8L12 22l-9-5.3V6.9L12 2zm0 2.2L5 7v7l7 4.1L19 14V7l-7-2.8z"/></svg>
            <h1 className="text-xl font-semibold">Portail Universitaire</h1>
          </div>
          <p className="text-sm text-slate-400">Connexion</p>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">Utilisateur
            <input className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label className="block text-sm">Mot de passe
            <input type="password" className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button
            className="btn w-full justify-center"
            onClick={() => dispatch(loginThunk({ username, password })).then(()=>dispatch(fetchMe()))}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )
}
