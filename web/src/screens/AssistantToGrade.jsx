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
  const [openSections, setOpenSections] = useState({}); // Stores open courses and assignments

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/assistant/tograde');
        setItems(data || []);
      } catch (error) {
        console.error("Failed to load items to grade:", error);
        setItems([]);
      }
    }
    load();
  }, []);

  // Group data by course_name, then by assignment title
  const groupedData = useMemo(() => {
    return items.reduce((acc, item) => {
      const course_name = item.course_name || 'Non spécifié';
      const assignment_title = item.title || 'Sans titre';

      if (!acc[course_name]) acc[course_name] = {};
      if (!acc[course_name][assignment_title]) acc[course_name][assignment_title] = [];
      acc[course_name][assignment_title].push(item);
      return acc;
    }, {});
  }, [items]);

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 dark:text-white tracking-tight">Travaux à Corriger</h1>

        {Object.keys(groupedData).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-2xl text-gray-600 dark:text-gray-300 font-semibold">Aucun travail à corriger pour le moment. Détendez-vous !</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {Object.entries(groupedData).map(([course_name, assignments]) => {
              // Find the first submission item to get department and auditorium for the course
              const firstAssignmentTitle = Object.keys(assignments)[0];
              const firstSubmissionOfCourse = assignments[firstAssignmentTitle] && assignments[firstAssignmentTitle].length > 0
                ? assignments[firstAssignmentTitle][0]
                : null;

              return (
                <div key={course_name} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <button onClick={() => toggleSection(course_name)} className="w-full text-left font-bold text-xl p-5 flex justify-between items-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 rounded-t-xl">
                    <div>
                      <span className="flex items-center text-indigo-600 dark:text-indigo-300">{course_name}</span>
                      {firstSubmissionOfCourse && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {firstSubmissionOfCourse.department || 'N/A'} • {firstSubmissionOfCourse.auditorium || 'N/A'}
                        </p>
                      )}
                    </div>
                    <svg className={`w-6 h-6 text-gray-500 dark:text-gray-400 transform ${openSections[course_name] ? 'rotate-90' : 'rotate-0'} transition-transform duration-200`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                  </button>
                  {openSections[course_name] && (
                    <div className="p-4 grid gap-3 border-t border-gray-200 dark:border-gray-700">
                      {Object.entries(assignments).map(([assignment_title, submissionItems]) => (
                        <div key={assignment_title} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-600">
                          <button onClick={() => toggleSection(`${course_name}-${assignment_title}`)} className="w-full text-left font-semibold text-lg p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200">
                            <span className="flex items-center text-blue-600 dark:text-blue-300">{assignment_title}</span>
                            <svg className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform ${openSections[`${course_name}-${assignment_title}`] ? 'rotate-90' : 'rotate-0'} transition-transform duration-200`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                          </button>
                          {openSections[`${course_name}-${assignment_title}`] && (
                            <div className="overflow-x-auto mt-3 border-t border-gray-200 dark:border-gray-600">
                              <table className="min-w-full text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-600">
                                <thead>
                                  <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 uppercase tracking-wider">
                                    <th className="py-3 px-4">Étudiant</th>
                                    <th className="py-3 px-4">Date de soumission</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(submissionItems || []).map(s => {
                                    const submissionUrl = s.type === 'Quiz'
                                      ? `/assistant/quizzes/${s.quiz_id}/submission/${s.submission_id}`
                                      : `/assistant/tptd/${s.assignment_id}/submission/${s.id}`;

                                    const buttonColorClass = s.type === 'Quiz'
                                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

                                    return (
                                      <tr key={s.id} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="py-2.5 px-4 font-medium text-gray-800 dark:text-gray-200">{s.student_name}</td>
                                        <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">{formatDate(s.submitted_at)}</td>
                                        <td className="py-2.5 px-4 text-right">
                                          <Link to={submissionUrl} className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${buttonColorClass}`}>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
