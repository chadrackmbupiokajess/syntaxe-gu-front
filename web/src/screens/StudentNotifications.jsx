import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { safeGet } from '../api/safeGet'

const typeColor = (t) => ({ quiz:'bg-amber-500', tptd:'bg-sky-500', finance:'bg-emerald-500', exam:'bg-fuchsia-500' }[t] || 'bg-slate-400')

export default function StudentNotifications() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  useEffect(() => { safeGet('/api/student/notifications', []).then(setItems) }, [])
  const filtered = items.filter(n => (type==='all'||n.type===type) && n.text.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <input placeholder="Rechercher..." className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={q} onChange={e => setQ(e.target.value)} />
        <select className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={type} onChange={e => setType(e.target.value)}>
          <option value="all">Tous</option>
          <option value="quiz">Quiz</option>
          <option value="tptd">TP/TD</option>
          <option value="finance">Finances</option>
          <option value="exam">Examens</option>
        </select>
      </div>
      <ul className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
        {filtered.map(n => (
          <li key={n.id} className="py-2 flex items-center gap-3">
            <span className={`inline-block w-2 h-2 rounded-full ${typeColor(n.type)}`}></span>
            <span className="flex-1 text-sm">{n.text}</span>
            <span className="text-xs text-slate-400">{n.at}</span>
          </li>
        ))}
        {filtered.length===0 && <li className="py-6 text-center text-sm text-slate-500">Aucune notification</li>}
      </ul>
    </div>
  )
}
