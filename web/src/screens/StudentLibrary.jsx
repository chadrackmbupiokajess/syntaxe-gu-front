import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { safeGet } from '../api/safeGet'

export default function StudentLibrary() {
  const [q, setQ] = useState('')
  const [catalog, setCatalog] = useState([])
  const [loans, setLoans] = useState([])
  useEffect(() => { (async ()=>{ setCatalog(await safeGet('/api/library/catalog', [])); setLoans(await safeGet('/api/library/myloans', [])) })() }, [])
  const filtered = catalog.filter(b => [b.title, b.author, b.isbn].join(' ').toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="grid gap-4">
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <input className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Rechercher dans le catalogue..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Titre</th>
                <th className="py-2 pr-4">Auteur</th>
                <th className="py-2 pr-4">ISBN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                  <td className="py-2 pr-4">{b.title}</td>
                  <td className="py-2 pr-4">{b.author}</td>
                  <td className="py-2 pr-4">{b.isbn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Mes emprunts</h3>
        <ul className="text-sm divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {loans.map(l => (
            <li key={l.id} className="py-2 flex items-center justify-between">
              <span>{l.title}</span>
              <span className="text-slate-500">Echéance: {l.due}</span>
            </li>
          ))}
          {loans.length===0 && <li className="py-6 text-center text-slate-500">Aucun emprunt</li>}
        </ul>
      </div>
    </div>
  )
}
