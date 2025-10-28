import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function AssistantQuizDetails() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    axios.get(`/api/quizzes/my/${id}/`).then(r => setQuiz(r.data));
  }, [id]);

  if (!quiz) return <p>Chargement...</p>;

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <Link to="/assistant/quizzes" className="btn">Retour</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
        <p><strong>Cours:</strong> {quiz.course_name}</p>
        <p><strong>Auditoire:</strong> {quiz.auditorium}</p>
        <p><strong>Département:</strong> {quiz.department}</p>
        <p><strong>Durée:</strong> {quiz.duration} minutes</p>
        <p><strong>Point total:</strong> {quiz.total_points}</p> {/* <-- AJOUTÉ */}
        <p><strong>Créé le:</strong> {new Date(quiz.created_at).toLocaleString()}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Questions</h2>
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} className="border p-4 rounded-lg mb-2 bg-slate-50 dark:bg-slate-800">
          <p className="font-semibold">{qIndex + 1}. {q.text}</p>
          {q.type !== 'text' && (
            <ul className="list-disc pl-5 mt-2">
              {q.choices.map((c, cIndex) => (
                <li key={cIndex} className={c.is_correct ? 'text-green-500' : ''}>{c.text}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
