import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AssistantGrades() {
  const [auditoriums, setAuditoriums] = useState([])
  const [aud, setAud] = useState('')
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => { axios.get('/api/auditoriums/assistant/my/').then(r => { setAuditoriums(r.data); if (r.data[0]) setAud(r.data[0].code) }) }, [])
  useEffect(() => { if (aud) axios.get(`/api/assistant/auditoriums/${encodeURIComponent(aud)}/courses`).then(r => { setCourses(r.data); if (r.data[0]) setCourse(r.data[0].code) }) }, [aud])
  useEffect(() => { if (aud && course) axios.get(`/api/assistant/grades/${encodeURIComponent(aud)}/${encodeURIComponent(course)}`).then(r => setRows(r.data)) }, [aud, course])

  const setGrade = async (student_id, grade) => {
    await axios.patch(`/api/assistant/grades/${encodeURIComponent(aud)}/${encodeURIComponent(course)}`, { student_id, grade: Number(grade) })
    setRows(prev => prev.map(x => x.student_id === student_id ? { ...x, grade: Number(grade) } : x))
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <select className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={aud} onChange={e => setAud(e.target.value)}>
          {auditoriums.map((a, index) => <option key={`${a.code}-${index}`} value={a.code}>{a.code} • {a.name}</option>)}
        </select>
        <select className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={course} onChange={e => setCourse(e.target.value)}>
          {courses.map((c, index) => <option key={`${c.code}-${index}`} value={c.code}>{c.code} • {c.title}</option>)}
        </select>
      </div>
      <div className="card p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Étudiant</th><th className="py-2 pr-4">Note /20</th></tr></thead>
          <tbody>
            {rows.map((r, index) => (
              <tr key={r.student_id || `student-row-${index}`} className="border-t border-slate-200/60 dark:border-slate-800/60">
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4">
                  <input type="number" min="0" max="20" step="0.5" value={r.grade ?? ''} onChange={(e)=>setGrade(r.student_id, e.target.value)} className="w-24 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
