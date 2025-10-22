import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

export default function StudentLayout() {
  const nav = [
    { to: '/etudiant', label: 'Tableau de bord' },
    { to: '/etudiant/profil', label: 'Profil' },
    { to: '/etudiant/travaux', label: 'Travaux à faire' },
    { to: '/etudiant/cours', label: 'Mes cours' },
    { to: '/etudiant/chat', label: 'Discussions' },
    { to: '/etudiant/notifications', label: 'Notifications' },
    { to: '/etudiant/calendrier', label: 'Calendrier' },
    { to: '/etudiant/bibliotheque', label: 'Bibliothèque' },
    { to: '/etudiant/notes', label: 'Mes notes' },
    { to: '/etudiant/documents', label: 'Documents' },
    { to: '/etudiant/paiements', label: 'Paiements' },
  ]
  return (
    <div className="min-h-[70vh] grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
      <aside className="card p-4 h-fit sticky top-20">
        <div className="font-semibold mb-3">Espace Étudiant</div>
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
