import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from '../store/authSlice'
import { Navigate } from 'react-router-dom'

export default function RoleLanding() {
  const dispatch = useDispatch()
  const { access, me } = useSelector(s => s.auth)

  useEffect(() => {
    if (access && !me) dispatch(fetchMe())
  }, [access, me, dispatch])

  if (!access) return <Navigate to="/login" replace />
  if (!me) return <p>Chargement...</p>

  // Redirection en fonction du premier rôle prioritaire
  const roles = (me.roles || []).map(r => (r || '').toLowerCase())
  // aliases pour uniformiser les rôles venant du backend
  const aliases = {
    student: 'etudiant',
    etudiant: 'etudiant',
    teacher: 'assistant',
    enseignant: 'assistant',
    assistant: 'assistant',
    librarian: 'bibliothecaire',
    bibliothecaire: 'bibliothecaire',
    it: 'service_it',
    service_it: 'service_it',
    cashier: 'caisse',
    caisse: 'caisse',
    dg: 'directeur_general',
    directeur_general: 'directeur_general',
    sga: 'sga',
    sgad: 'sgad',
    chef_section: 'chef_section',
    chef_departement: 'chef_departement',
    jury: 'jury',
    apparitorat: 'apparitorat',
    pdg: 'pdg',
  }
  const norm = Array.from(new Set(roles.map(r => aliases[r] || r)))
  const priority = [
    // On privilégie l'espace étudiant si présent
    'etudiant',
    'assistant', 'enseignant',
    'bibliothecaire', 'service_it', 'caisse',
    'jury', 'apparitorat',
    'chef_section', 'chef_departement',
    'sga', 'sgad', 'directeur_general', 'pdg',
  ]
  const target = priority.find(r => norm.includes(r)) || 'etudiant'
  const map = {
    pdg: '/pdg',
    directeur_general: '/dg',
    sga: '/sga',
    sgad: '/sgad',
    chef_section: '/section',
    chef_departement: '/departement',
    jury: '/jury',
    apparitorat: '/apparitorat',
    caisse: '/caisse',
    service_it: '/it',
    bibliothecaire: '/bibliotheque',
    assistant: '/assistant',
    enseignant: '/assistant',
    etudiant: '/etudiant',
  }
  return <Navigate to={map[target]} replace />
}
