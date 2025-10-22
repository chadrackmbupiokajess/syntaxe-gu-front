import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { safeGet } from '../api/safeGet'

export default function StudentDocuments() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  useEffect(() => { safeGet('/api/student/documents', []).then(setRows) }, [])
  const filtered = rows.filter(r => [r.type, r.label].join(' ').toLowerCase().includes(q.toLowerCase()))
  const badge = (s) => s==='ready' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <input className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Rechercher..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Libellé</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Statut</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                <td className="py-2 pr-4">{d.type}</td>
                <td className="py-2 pr-4">{d.label}</td>
                <td className="py-2 pr-4">{d.date}</td>
                <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${badge(d.status)}`}>{d.status}</span></td>
                <td className="py-2 pr-4 text-right">
                  {d.url ? <a className="btn" href={d.url} target="_blank" rel="noreferrer">Télécharger</a> : <span className="text-slate-400">Indisponible</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
