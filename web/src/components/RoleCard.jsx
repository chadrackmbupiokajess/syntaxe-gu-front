import React from 'react'
import { Link } from 'react-router-dom'

export default function RoleCard({ to, title, desc, icon }) {
  return (
    <Link to={to} className="card p-4 hover:shadow transition block">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-600/10 text-brand-700 dark:text-brand-100 grid place-items-center">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          {desc && <div className="text-sm text-slate-500 dark:text-slate-400">{desc}</div>}
        </div>
      </div>
    </Link>
  )
}
