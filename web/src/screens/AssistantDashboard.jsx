import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import { Link } from 'react-router-dom'

export default function AssistantDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get('/api/assistant/summary').then(r => setData(r.data))
  }, [])

  if (!data) return <p className="text-center text-lg py-8 text-black dark:text-white">Chargement...</p>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Tableau de Bord Assistant</h1>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Mes auditoires</h3>
          <ul className="text-sm grid gap-3">
            {data.auditoriums.map((a, i) => {
              return (
                <li key={i} className="flex items-center justify-between border rounded-lg px-4 py-3 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div>
                    <Link to={`/assistant/auditoires/${a.code}`}>
                      <span className="font-medium text-gray-800 dark:text-white text-base">{a.code}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> {a.department || 'N/A'}</p>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{a.students} étudiants</span>
                    <Link to={`/assistant/auditoires/${a.code}/messages`} className="px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200 text-sm">Messages</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}