import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  let formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1).replace('.', '');
};

export default function AssistantToGrade() {
  const [items, setItems] = useState([]);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    const load = async () => {
      const { data } = await axios.get('/api/assistant/tograde');
      setItems(data);
    }
    load();
  }, []);

  const groupedData = useMemo(() => {
    return items.reduce((acc, item) => {
      const { department, auditorium, course_name, title } = item;
      if (!acc[department]) acc[department] = {};
      if (!acc[department][auditorium]) acc[department][auditorium] = {};
      if (!acc[department][auditorium][course_name]) acc[department][auditorium][course_name] = {};
      if (!acc[department][auditorium][course_name][title]) acc[department][auditorium][course_name][title] = [];
      acc[department][auditorium][course_name][title].push(item);
      return acc;
    }, {});
  }, [items]);

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-400">Travaux à Corriger</h1>

      {Object.keys(groupedData).length === 0 ? (
        <div className="card p-8 text-center bg-slate-800 rounded-lg shadow-lg">
          <p className="text-xl text-slate-400">Aucun travail à corriger pour le moment. Détendez-vous !</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {Object.entries(groupedData).map(([department, auditoriums]) => (
            <div key={department} className="bg-slate-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
              <button onClick={() => toggleSection(department)} className="w-full text-left font-semibold text-lg p-4 flex justify-between items-center bg-slate-700 hover:bg-slate-600 transition-colors duration-200 rounded-t-lg">
                <span className="flex items-center text-indigo-300">
                  {department}
                  <span className="ml-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">{Object.values(auditoriums).flatMap(c => Object.values(c).flatMap(t => Object.values(t).flat())).length}</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 text-indigo-300 transition-transform duration-300 ${openSections[department] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {openSections[department] && (
                <div className="p-4 grid gap-3 border-t border-slate-700">
                  {Object.entries(auditoriums).map(([auditorium, courses]) => (
                    <div key={auditorium} className="bg-slate-700 rounded-lg shadow-sm overflow-hidden">
                      <button onClick={() => toggleSection(auditorium)} className="w-full text-left font-medium text-md p-3 flex justify-between items-center bg-slate-600 hover:bg-slate-500 transition-colors duration-200">
                        <span className="flex items-center text-sky-300">
                          {auditorium}
                          <span className="ml-3 bg-sky-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{Object.values(courses).flatMap(t => Object.values(t).flat()).length}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-sky-300 transition-transform duration-300 ${openSections[auditorium] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                      {openSections[auditorium] && (
                        <div className="p-3 grid gap-2 border-t border-slate-600">
                          {Object.entries(courses).map(([course_name, assignments]) => (
                            <div key={course_name} className="bg-slate-600 rounded-lg shadow-xs overflow-hidden">
                              <button onClick={() => toggleSection(course_name)} className="w-full text-left font-normal text-sm p-2 flex justify-between items-center bg-slate-500 hover:bg-slate-400 transition-colors duration-200">
                                <span className="flex items-center text-emerald-300">
                                  {course_name}
                                  <span className="ml-3 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{Object.values(assignments).flat().length}</span>
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-emerald-300 transition-transform duration-300 ${openSections[course_name] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              </button>
                              {openSections[course_name] && (
                                <div className="p-2 grid gap-1 border-t border-slate-500">
                                  {Object.entries(assignments).map(([assignment_title, submissions]) => (
                                    <div key={assignment_title} className="bg-slate-500 rounded-lg">
                                      <button onClick={() => toggleSection(assignment_title)} className="w-full text-left font-normal text-xs p-2 flex justify-between items-center hover:bg-slate-400 transition-colors duration-200">
                                        <span className="flex items-center text-purple-300">
                                          {assignment_title}
                                          <span className="ml-3 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{submissions.length}</span>
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-purple-300 transition-transform duration-300 ${openSections[assignment_title] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                      </button>
                                      {openSections[assignment_title] && (
                                        <div className="overflow-x-auto mt-2 border-t border-slate-400">
                                          <table className="min-w-full text-sm text-slate-200">
                                            <thead>
                                              <tr className="text-left text-slate-400 bg-slate-600">
                                                <th className="py-2 px-4">Étudiant</th>
                                                <th className="py-2 px-4">Date de soumission</th>
                                                <th className="py-2 px-4 text-right">Action</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {submissions.map(s => {
                                                const submissionUrl = s.type === 'quiz'
                                                  ? `/assistant/quizzes/${s.assignment_id}/submission/${s.id}`
                                                  : `/assistant/tptd/${s.assignment_id}/submission/${s.id}`;

                                                return (
                                                  <tr key={s.id} className="border-t border-slate-700 hover:bg-slate-600 transition-colors duration-150">
                                                    <td className="py-2 px-4 font-medium text-slate-100">{s.student_name}</td>
                                                    <td className="py-2 px-4 text-slate-300">{formatDate(s.submitted_at)}</td>
                                                    <td className="py-2 px-4 text-right">
                                                      <Link to={submissionUrl} className="btn bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200 shadow-md">
                                                        Corriger
                                                      </Link>
                                                    </td>
                                                  </tr>
                                                );
                                              })}
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
