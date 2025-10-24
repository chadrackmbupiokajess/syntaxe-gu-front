import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  let formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

export default function AssistantQuizDetails() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/quizzes/my/${id}/`);
        setQuiz(data);
      } catch (err) {
        setError('Impossible de charger les détails du quiz.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [id]);

  if (loading) {
    return <div className="card p-4">Chargement...</div>;
  }

  if (error) {
    return <div className="card p-4 text-red-500">{error}</div>;
  }

  if (!quiz) {
    return <div className="card p-4">Aucun détail trouvé pour ce quiz.</div>;
  }

  return (
    <div className="grid gap-6">
        <div className="flex items-center">
            <Link to="/assistant/quizzes" className="btn btn-sm mr-4">{"<-"} Retour</Link>
            <h1 className="text-2xl font-bold">Détails du Quiz</h1>
        </div>
      
      <div className="card p-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <div className="space-y-4">
            <h3 className="font-semibold">Questions</h3>
            {quiz.questions && quiz.questions.length > 0 ? (
              <ul className="list-decimal pl-5 space-y-4">
                {quiz.questions.map((q, q_index) => (
                  <li key={q_index} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium whitespace-pre-wrap">{q.text}</p>
                    <p className="text-sm text-slate-500">Type: {q.type}</p>
                    {q.choices && q.choices.length > 0 && (
                      <ul className="list-disc pl-5 text-sm mt-1">
                        {q.choices.map((c, c_index) => (
                          <li key={c_index} className={`${c.is_correct ? 'text-green-500 font-semibold' : ''}`}>
                            {c.text} {c.is_correct && '(Correct)'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune question définie pour ce quiz.</p>
            )}
          </div>
        </div>
        <div className="space-y-3 text-sm">
            <p><strong>Cours:</strong> {quiz.course_name}</p>
            <p><strong>Auditoire:</strong> {quiz.auditorium}</p>
            <p><strong>Département:</strong> {quiz.department}</p>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <p><strong>Durée:</strong> {quiz.duration} minutes</p>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <p><strong>Créé le:</strong> {formatDate(quiz.created_at)}</p>
        </div>
      </div>

      {/* Placeholder for results list */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Résultats des étudiants</h3>
        <p className="text-slate-500">Les résultats des étudiants seront bientôt disponibles ici.</p>
      </div>
    </div>
  );
}
