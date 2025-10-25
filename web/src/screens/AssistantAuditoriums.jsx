import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function AssistantAuditoriums() {
  const [rows, setRows] = useState([])
  const [courses, setCourses] = useState({})
  const [students, setStudents] = useState({})
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAuditoriums = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axios.get('/api/auditoriums/assistant/my/');
        setRows(response.data);
      } catch (err) {
        console.error("Error fetching auditoriums:", err);
        setError(true);
        // Removed mock data for auditoriums
      } finally {
        setLoading(false);
      }
    };
    fetchAuditoriums();
  }, [])

  const loadCourses = async (code) => {
    if (courses[code]) { // Toggle visibility if already loaded
      setCourses(prev => ({ ...prev, [code]: null }));
      return;
    }
    try {
      const { data } = await axios.get(`/api/assistant/auditoriums/${encodeURIComponent(code)}/courses`);
      setCourses(prev => ({ ...prev, [code]: data }));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(true);
      // Removed mock data for courses
    }
  }

  const loadStudents = async (code) => {
    if (students[code]) { // Toggle visibility if already loaded
      setStudents(prev => ({ ...prev, [code]: null }));
      return;
    }
    try {
      const { data } = await axios.get(`/api/assistant/auditoriums/${encodeURIComponent(code)}/students`);
      setStudents(prev => ({ ...prev, [code]: data }));
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(true);
      // Removed mock data for students
    }
  }

  if (loading) return <p className="text-gray-700 p-4">Chargement des auditoires...</p>;
  if (error) return <p className="text-red-500 p-4">Certaines données n'ont pas pu être chargées. Veuillez vérifier votre connexion ou réessayer.</p>;

  return (
    <div className="grid gap-4">
      {rows.filter(a => a.code).map(a => {
        return (
          <div key={a.code} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Link to={`/assistant/auditoires/${a.code}`} className="font-semibold">
                  {a.code} - {a.name}
                </Link>
                {a.department && (
                  <div className="text-xs text-slate-500 dark:text-white/70">Département: {a.department}</div>
                )}
              </div>
              <div className="text-sm text-slate-500 dark:text-white/70">{a.students} étudiants, {a.course_count} cours</div>
            </div>
            <div className="flex gap-2 mb-2">
              <button className="btn" onClick={() => loadCourses(a.code)}>Voir cours</button>
              <button className="btn !bg-slate-700" onClick={() => loadStudents(a.code)}>Voir étudiants</button>
            </div>
            {courses[a.code] && (
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Intitulé</th></tr></thead>
                  <tbody>
                    {courses[a.code].map(c => (
                      <tr key={c.code} className="border-t border-slate-200/60 dark:border-slate-800/60">
                        <td className="py-2 pr-4">{c.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {students[a.code] && (
              <div className="overflow-auto mt-3">
                <table className="min-w-full text-sm">
                  <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Nom</th></tr></thead>
                  <tbody>
                    {students[a.code].map(s => (
                      <tr key={s.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                        <td className="py-2 pr-4">{s.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  )
}
