import React from 'react'

export default function KpiCard({ label, value, hint, icon }) {
  return (
    <div className="card p-4 flex items-center space-x-4">
      {icon && <div className="text-3xl text-indigo-500 dark:text-indigo-400">{icon}</div>}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
        {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
      </div>
    </div>
  )
}
