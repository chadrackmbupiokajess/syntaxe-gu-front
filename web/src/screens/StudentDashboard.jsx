import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { safeGet } from '../api/safeGet'
import KpiCard from '../components/KpiCard'
import StudentWork from './StudentWork'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [meta, setMeta] = useState(null)
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [notes, setNotes] = useState([])

  useEffect(() => {
    (async () => {
      const [d, m, g, c, attempts, submissions] = await Promise.all([
        safeGet('/api/student/summary', null),
        safeGet('/api/student/meta', null),
        safeGet('/api/student/grades/recent', []),
        safeGet('/api/student/courses', []),
        safeGet('/api/quizzes/student/my-attempts/', []),
        safeGet('/api/tptd/student/my-submissions/', []),
      ])
      if (d) setData(d)
      if (m) setMeta(m)
      setGrades(g || [])
      setCourses(c || [])

      const courseCredits = (c || []).reduce((acc, course) => {
        acc[course.title] = course.credits;
        return acc;
      }, {});

      const a = (attempts || []).map(item => {
        const gradeValue = (item.score !== null && item.score !== undefined && item.total_questions)
          ? (item.score / item.total_questions) * 10
          : null;

        return {
          credits: courseCredits[item.course_name] || 0,
          grade: gradeValue
        };
      });

      const s = (submissions || []).map(item => {
        const gradeValue = (item.grade !== null && item.grade !== undefined && item.total_points)
          ? (item.grade / item.total_points) * 10
          : null;

        return {
          credits: courseCredits[item.course_name] || 0,
          grade: gradeValue
        };
      });

      setNotes([...a, ...s].filter(n => n.grade !== null));
    })()
  }, [])

  const totalCredits = useMemo(() => {
    return courses.reduce((sum, course) => sum + course.credits, 0);
  }, [courses]);

  const gpa = useMemo(() => {
    if (!notes.length) return 0;
    const gradedNotes = notes.filter(n => typeof n.grade === 'number');
    const totalCreds = gradedNotes.reduce((s, r) => s + (r.credits || 0), 0);
    if (totalCreds === 0) {
        if (gradedNotes.length === 0) return 0;
        const simpleAvg = gradedNotes.reduce((s, r) => s + r.grade, 0) / gradedNotes.length;
        return simpleAvg.toFixed(2);
    }
    const weighted = gradedNotes.reduce((s, r) => s + (r.grade * (r.credits || 0)), 0);
    return (weighted / totalCreds).toFixed(2);
  }, [notes]);

  if (!data) return <p>Chargement...</p>

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Programme" value={data.program} color="blue" />
        <KpiCard label="Semestre" value={data.semester} color="green" />
        <KpiCard label="Crédits" value={totalCredits} color="orange" />
        <KpiCard label="GPA" value={gpa} color="red" />
      </div>
      <div className="card p-4">
        <h3 className="text-lg font-semibold">Prochains événements</h3>
        <ul className="mt-2 list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
          {data.nextEvents.map((e, i) => (
            <li key={i}>{e.title} • <span className="text-slate-400">{e.date}</span></li>
          ))}
        </ul>
      </div>
      {meta && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-2">Informations</h3>
            <div className="grid grid-cols-2 text-sm gap-y-2">
              <div className="text-slate-500">Auditoire</div><div>{meta.auditorium}</div>
              <div className="text-slate-500">Session</div><div>{meta.session}</div>
              <div className="text-slate-500">Département</div><div>{meta.department}</div>
              <div className="text-slate-500">Faculté</div><div>{meta.faculty}</div>
              <div className="text-slate-500">Matricule</div><div>{meta.matricule}</div>
              <div className="text-slate-500">Email</div><div>{meta.email}</div>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-2">Notes récentes</h3>
            <div style={{width:'100%', height:220}}>
              <ResponsiveContainer>
                <AreaChart data={grades} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="course" tick={{fontSize:12}}/>
                  <YAxis domain={[0,10]} tick={{fontSize:12}}/>
                  <Tooltip/>
                  <Area type="monotone" dataKey="grade" stroke="#6366f1" fillOpacity={1} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Travaux à faire</h3>
        <StudentWork />
      </div>
    </div>
  )
}
