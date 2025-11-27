import React, { useEffect, useMemo, useState } from 'react';
import { safeGet } from '../api/safeGet';
import { Link, useLocation } from 'react-router-dom';

function Timer({ deadline }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(deadline) - new Date()));
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, new Date(deadline) - new Date())), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const d = useMemo(() => {
    const days = Math.floor(left / (1000 * 60 * 60 * 24));
    const hours = Math.floor((left / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((left / 1000 / 60) % 60);
    const seconds = Math.floor((left / 1000) % 60);
    if (days > 0) return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    return `${hours}h ${minutes}m ${seconds}s`;
  }, [left]);

  return <span className="text-sm font-semibold">{d}</span>;
}

export default function StudentWork() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'tptd');
  const [quizzes, setQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [tptd, setTptd] = useState([]);
  const [subs, setSubs] = useState([]);

  const loadAll = async () => {
    const [q, a, t, s] = await Promise.all([
      safeGet('/api/quizzes/student/available/', []),
      safeGet('/api/quizzes/student/my-attempts/', []),
      safeGet('/api/tptd/student/available/', []),
      safeGet('/api/tptd/student/my-submissions/', []),
    ]);
    setQuizzes(q || []);
    setQuizAttempts(a || []);
    setTptd(t || []);
    setSubs(s || []);
  };

  useEffect(() => { loadAll() }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center mb-6">
        <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1">
          <button className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'tptd' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`} onClick={() => setTab('tptd')}>TP/TD</button>
          <button className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'quiz' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`} onClick={() => setTab('quiz')}>Quiz</button>
        </div>
      </div>

      {tab === 'tptd' && (
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Travaux Pratiques et Dirigés à faire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tptd.map(t => (
                <Link to={`/etudiant/tptd/${t.id}`} key={t.id} className="card block hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                  <div className="p-4">
                    <div className="font-bold text-lg mb-1">{t.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.course_name} - {t.type}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">Par: {t.assistant_name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">À rendre avant le: {new Date(t.deadline).toLocaleString()}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">Temps restant:</div>
                      <Timer deadline={t.deadline} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 mt-8">Mes Soumissions</h2>
            <div className="card p-4">
              <ul className="space-y-3">
                {subs.map(s => (
                  <li key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{s.course_name} - {s.session_type}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Par: {s.assistant_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Soumis le: {new Date(s.submitted_at).toLocaleString()}</div>
                    </div>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${s.status === 'non-soumis' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : (s.grade != null ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200')}`}>
                      {s.status === 'non-soumis' ? `Temps écoulé - Note: ${s.grade}/${s.total_points}` : (s.grade != null ? `Note: ${s.grade}/${s.total_points}` : 'En attente')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Quiz disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map(q => (
                <Link to={`/etudiant/quiz/${q.id}`} key={q.id} className="card p-4 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                  <div>
                    <div className="font-bold text-lg mb-1">{q.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{q.course_name} - {q.session_type}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">Par: {q.assistant_name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Durée: {q.duration} min</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">À passer avant le: {new Date(q.deadline).toLocaleString()}</div>
                  </div>
                  <div className="btn mt-4 w-full text-center">Passer le Quiz</div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 mt-8">Mes Soumissions de Quiz</h2>
            <div className="card p-4">
              <ul className="space-y-3">
                {quizAttempts.map(s => (
                    <li key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div>
                        <div className="font-medium">{s.quiz_title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{s.course_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Par: {s.assistant_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Soumis le: {new Date(s.submitted_at).toLocaleString()}</div>
                      </div>
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${s.score != null ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'}`}>
                        {s.score != null ? `Note: ${s.score}/${s.total_points}` : 'En attente de correction'}
                      </span>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
