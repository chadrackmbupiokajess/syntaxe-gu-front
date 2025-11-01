import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function DgLayout() {
  const nav = [
    { to: '/dg', label: 'Tableau de bord' },
    { to: '/dg/academic-reports', label: 'Rapports Académiques' },
    { to: '/dg/financial-reports', label: 'Rapports Financiers' },
    { to: '/dg/personnel-management', label: 'Gestion du Personnel' },
    { to: '/dg/validation', label: 'Validation & Approbation' },
    { to: '/dg/communication', label: 'Communication Interne' },
  ]
  return (
    <div className="min-h-[70vh] grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
      <aside className="card p-4 h-fit sticky top-20">
        <div className="font-semibold mb-3">Espace Directeur Général</div>
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
