import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function RoleRoute({ roles = [], children }) {
  const { access, me } = useSelector(s => s.auth)
  if (!access) return <Navigate to="/login" replace />
  // Tant que le profil n'est pas charge, on attend pour eviter les boucles de redirection
  if (!me) return <p>Chargement...</p>
  const userRoles = new Set((me?.roles || []).map(r => (r || '').toLowerCase()))
  const allowed = roles.length === 0 || roles.some(r => userRoles.has((r || '').toLowerCase()))
  if (!allowed) return <Navigate to="/" replace />
  return children
}
