import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'

export default function AssistantDashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { axios.get('/api/assistant/summary').then(r => setData(r.data)) }, [])
  if (!data) return <p>Chargement...</p>
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Mes cours" value={data.courses} />
        <KpiCard label="TP/TD actifs" value={data.activeTPTD} />
        <KpiCard label="Quiz actifs" value={data.activeQuizzes} />
        <KpiCard label="À corriger" value={data.toGrade} />
      </div>
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Mes auditoires</h3>
        <ul className="text-sm grid gap-2">
          {data.auditoriums.map((a, i) => (
            <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2 border-slate-200/60 dark:border-slate-800/60">
              <span className="font-medium">{a.code}</span>
              <span className="text-slate-500">{a.students} étudiants</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
