import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { safeGet } from '../api/safeGet'

export default function StudentNotes() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    const fetchNotes = async () => {
      const [attempts, submissions] = await Promise.all([
        safeGet('/api/quizzes/student/my-attempts/', []),
        safeGet('/api/tptd/student/my-submissions/', [])
      ]);

      const a = (attempts || []).map(item => ({
        code: item.course_name,
        title: item.quiz_title,
        credits: 0, // Credits not available in this endpoint
        grade: item.score
      }));

      const s = (submissions || []).map(item => ({
        code: item.course_name,
        title: item.title,
        credits: 0, // Credits not available in this endpoint
        grade: item.grade
      }));

      setRows([...a, ...s]);
    };

    fetchNotes();
  }, [])

  const filtered = rows.filter(r => [r.code, r.title].join(' ').toLowerCase().includes(q.toLowerCase()))
  
  const avg = useMemo(() => {
    if (!rows.length) return 0
    const totalCredits = rows.reduce((s, r) => s + (r.credits || 0), 0)
    const weighted = rows.reduce((s, r) => s + (r.grade * (r.credits || 0)), 0)
    return totalCredits ? (weighted / totalCredits).toFixed(2) : 0
  }, [rows])

  const exportCSV = () => {
    const headers = ['Code', 'Intitulé', 'Crédits', 'Note']
    const lines = filtered.map(r => [r.code, r.title, r.credits, r.grade])
    const csv = [headers, ...lines].map(a => a.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'notes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Moyenne pondérée (sur 20)</div>
          <div className="text-2xl font-semibold">{avg}</div>
        </div>
        <button className="btn" onClick={exportCSV}>Exporter CSV</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <input className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Rechercher un cours..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Intitulé</th>
                <th className="py-2 pr-4">Crédits</th>
                <th className="py-2 pr-4">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r,i) => (
                <tr key={i} className="border-t border-slate-200/60 dark:border-slate-800/60">
                  <td className="py-2 pr-4 font-medium">{r.code}</td>
                  <td className="py-2 pr-4">{r.title}</td>
                  <td className="py-2 pr-4">{r.credits}</td>
                  <td className="py-2 pr-4">{r.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
