import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useToast } from '../shared/ToastProvider'
import { Link } from 'react-router-dom';

export default function AssistantQuizzes() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [openSections, setOpenSections] = useState({});
  const [newlyCreatedIds, setNewlyCreatedIds] = useState(new Set());

  const load = async () => { 
      const { data } = await axios.get('/api/quizzes/my/'); 
      setRows(data); 
      const newIds = new Set(JSON.parse(sessionStorage.getItem('newQuizIds') || '[]'));
      setNewlyCreatedIds(newIds);
  }
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

  const toggleSection = (key, level, idsToMarkAsSeen = []) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    if (level === 'course' && !openSections[key] && idsToMarkAsSeen.length > 0) {
        const newSet = new Set(newlyCreatedIds);
        idsToMarkAsSeen.forEach(id => newSet.delete(id));
        sessionStorage.setItem('newQuizIds', JSON.stringify(Array.from(newSet)));
        setNewlyCreatedIds(newSet);
    }
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
        {Object.entries(groupedData).map(([department, auditoriums]) => {
          const newInDeptCount = Object.values(auditoriums).flatMap(courses => Object.values(courses).flat()).filter(item => newlyCreatedIds.has(item.id)).length;
          return (
            <div key={department} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 py-2">
              <button onClick={() => toggleSection(department, 'department')} className="w-full text-left font-semibold text-lg flex justify-between items-center">
                <span className="flex items-center">
                  {department}
                  {newInDeptCount > 0 && <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newInDeptCount}</span>}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[department] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {openSections[department] && (
                <div className="pl-4 mt-2 grid gap-2">
                  {Object.entries(auditoriums).map(([auditorium, courses]) => {
                    const newInAuditoriumCount = Object.values(courses).flat().filter(item => newlyCreatedIds.has(item.id)).length;
                    return (
                      <div key={auditorium} className="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <button onClick={() => toggleSection(auditorium, 'auditorium')} className="w-full text-left font-medium text-md flex justify-between items-center">
                          <span className="flex items-center">
                            {auditorium}
                            {newInAuditoriumCount > 0 && <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newInAuditoriumCount}</span>}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[auditorium] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                        {openSections[auditorium] && (
                          <div className="pl-4 mt-2 grid gap-2">
                            {Object.entries(courses).map(([course_name, quizList]) => {
                                const newInCourseCount = quizList.filter(item => newlyCreatedIds.has(item.id)).length;
                                const idsInCourse = quizList.map(item => item.id);
                              return (
                                <div key={course_name} className="border-l border-slate-200 dark:border-slate-700 pl-4">
                                  <button onClick={() => toggleSection(course_name, 'course', idsInCourse)} className="w-full text-left font-normal text-sm flex justify-between items-center">
                                    <span className="flex items-center">
                                      {course_name}
                                      {newInCourseCount > 0 && <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newInCourseCount}</span>}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[course_name] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                  </button>
                                  {openSections[course_name] && (
                                    <div className="overflow-auto mt-2">
                                      <table className="min-w-full text-sm">
                                        <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Titre</th><th className="py-2 pr-4">Durée</th><th className="py-2 pr-4"></th></tr></thead>
                                        <tbody>
                                          {quizList.map(q => (
                                            <tr key={q.id} className={`border-t border-slate-200/60 dark:border-slate-800/60 relative`}>
                                               {newlyCreatedIds.has(q.id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                                              <td className="py-2 pl-4 pr-4 font-medium"><Link to={`/assistant/quizzes/${q.id}`} className="hover:underline">{q.title}</Link></td>
                                              <td className="py-2 pr-4">{q.duration} min</td>
                                              <td className="py-2 pr-4 text-right"><button className="btn !bg-red-600" onClick={()=>del(q.id)}>Supprimer</button></td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
