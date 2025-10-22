import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { safeGet } from '../api/safeGet'

export default function StudentCourses() {
  const [courses, setCourses] = useState([])
  useEffect(() => { safeGet('/api/student/courses', []).then(setCourses) }, [])
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-3">Mes cours</h3>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Intitulé</th>
              <th className="py-2 pr-4">Crédits</th>
              <th className="py-2 pr-4">Enseignant</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.code} className="border-t border-slate-200/60 dark:border-slate-800/60">
                <td className="py-2 pr-4 font-medium">{c.code}</td>
                <td className="py-2 pr-4">{c.title}</td>
                <td className="py-2 pr-4">{c.credits}</td>
                <td className="py-2 pr-4">{c.instructor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
