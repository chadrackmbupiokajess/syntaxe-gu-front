import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useToast } from '../shared/ToastProvider'
import { Link } from 'react-router-dom';

export default function AssistantQuizzes() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [openSections, setOpenSections] = useState({});

  const load = async () => { const { data } = await axios.get('/api/quizzes/my/'); setRows(data) }
  useEffect(() => { load() }, [])

  const groupedData = useMemo(() => {
    return rows.reduce((acc, row) => {
      const { department, auditorium, course_name } = row;
      if (!acc[department]) acc[department] = {};
      if (!acc[department][auditorium]) acc[department][auditorium] = {};
      if (!acc[department][auditorium][course_name]) acc[department][auditorium][course_name] = [];
      acc[department][auditorium][course_name].push(row);
      return acc;
    }, {});
  }, [rows]);

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const del = async (id) => { 
    await axios.delete(`/api/quizzes/my/${id}/`)
    await load()
    toast.push({ title: 'Quiz supprimé' })
  }

  return (
    <div className="grid gap-4">
        <div className="flex justify-end">
            <Link to="/assistant/quizzes/new" className="btn">Nouveau Quiz</Link>
        </div>

      <div className="card p-4 grid gap-2">
        <h3 className="text-lg font-semibold mb-2">Mes Quiz</h3>
        {Object.entries(groupedData).map(([department, auditoriums]) => (
          <div key={department} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 py-2">
            <button onClick={() => toggleSection(department)} className="w-full text-left font-semibold text-lg flex justify-between items-center">
              <span>{department}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[department] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {openSections[department] && (
              <div className="pl-4 mt-2 grid gap-2">
                {Object.entries(auditoriums).map(([auditorium, courses]) => (
                  <div key={auditorium} className="border-l border-slate-200 dark:border-slate-700 pl-4">
                    <button onClick={() => toggleSection(auditorium)} className="w-full text-left font-medium text-md flex justify-between items-center">
                      <span>{auditorium}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[auditorium] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {openSections[auditorium] && (
                      <div className="pl-4 mt-2 grid gap-2">
                        {Object.entries(courses).map(([course_name, quizList]) => (
                          <div key={course_name}>
                            <button onClick={() => toggleSection(course_name)} className="w-full text-left font-normal text-sm flex justify-between items-center">
                              <span>{course_name}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[course_name] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            {openSections[course_name] && (
                              <div className="overflow-auto mt-2">
                                <table className="min-w-full text-sm">
                                  <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Titre</th><th className="py-2 pr-4">Durée</th><th className="py-2 pr-4"></th></tr></thead>
                                  <tbody>
                                    {quizList.map(q => (
                                      <tr key={q.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                                        <td className="py-2 pr-4 font-medium"><Link to={`/assistant/quizzes/${q.id}`} className="hover:underline">{q.title}</Link></td>
                                        <td className="py-2 pr-4">{q.duration} min</td>
                                        <td className="py-2 pr-4 text-right"><button className="btn !bg-red-600" onClick={()=>del(q.id)}>Supprimer</button></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
