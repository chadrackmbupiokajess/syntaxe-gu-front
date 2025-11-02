import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function SgaLayout() {
  const nav = [
    { to: '/sga', label: 'Tableau de bord' },
    { to: '/sga/inscriptions', label: 'Gestion des Inscriptions' },
    { to: '/sga/programmes', label: 'Programmes d\'études' },
    { to: '/sga/auditoires', label: 'Auditoires & Horaires' },
    { to: '/sga/deliberations', label: 'Délibérations' },
    { to: '/sga/profil', label: 'Profil' },
  ]
  return (
    <div className="min-h-[70vh] grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
      <aside className="card p-4 h-fit sticky top-20">
        <div className="font-semibold mb-3">Espace SGA</div>
        <nav className="grid gap-1">
          {nav.map(i => (
            <NavLink key={i.to} end={i.to === '/sga'} to={i.to} className={({isActive}) => `px-3 py-2 rounded-lg ${isActive? 'bg-brand-600 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
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
