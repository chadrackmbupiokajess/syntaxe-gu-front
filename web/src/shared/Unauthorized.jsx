import React from 'react'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">Accès refusé</h1>
        <p className="text-slate-500">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <div className="space-x-3">
          <Link className="btn" to="/">Aller à l'accueil</Link>
          <Link className="btn btn-secondary" to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  )
}
