import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import { Link } from 'react-router-dom'

export default function AssistantDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get('/api/assistant/summary').then(r => setData(r.data))
  }, [])

  if (!data) return <p>Chargement...</p>

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/assistant/courses">
          <KpiCard label="Mes cours" value={data.courses} />
        </Link>
        <Link to="/assistant/tptd">
          <KpiCard label="TP/TD actifs" value={data.activeTPTD} />
        </Link>
        <Link to="/assistant/quizzes">
          <KpiCard label="Quiz actifs" value={data.activeQuizzes} />
        </Link>
        <Link to="/assistant/to-grade">
          <KpiCard label="À corriger" value={data.toGrade} />
        </Link>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Mes auditoires</h3>
        <ul className="text-sm grid gap-2">
          {data.auditoriums.map((a, i) => {
            return (
              <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2 border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <Link to={`/assistant/auditoires/${a.code}`}>
                    <span className="font-medium">{a.code}</span>
                    <p className="text-xs text-slate-500 mt-1"> {a.department || 'N/A'}</p>
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">{a.students} étudiants</span>
                  <Link to={`/assistant/auditoires/${a.code}/messages`} className="btn btn-sm">Messages</Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}
