import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function DepartementLayout() {
  const nav = [
    { to: '/departement', label: 'Tableau de bord' },
    { to: '/departement/pedagogie', label: 'Gestion Pédagogique' },
    { to: '/departement/enseignants', label: 'Gestion des Enseignants' },
    { to: '/departement/etudiants', label: 'Gestion des Étudiants' },
    { to: '/departement/profil', label: 'Profil' },
  ]
  return (
    <div className="min-h-[70vh] grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
      <aside className="card p-4 h-fit sticky top-20">
        <div className="font-semibold mb-3">Espace Chef de Département</div>
        <nav className="grid gap-1">
          {nav.map(i => (
            <NavLink key={i.to} to={i.to} className={({isActive}) => `px-3 py-2 rounded-lg ${isActive? 'bg-brand-600 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  )
}
