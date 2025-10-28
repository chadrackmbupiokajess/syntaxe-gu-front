import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function AssistantQuizAttemptDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/assistant/quiz/attempt/${attemptId}/`);
        setAttempt(data);
        // Pré-remplir les notes pour les questions textuelles
        const initialGrades = {};
        data.questions.forEach(q => {
          if (q.question_type === 'text') {
            initialGrades[q.question_id] = q.points_obtained || 0;
          }
        });
        setGrades(initialGrades);
      } catch (err) {
        setError('Impossible de charger les détails de la tentative.');
        toast.push({ title: 'Erreur', message: 'Impossible de charger les détails.' });
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptDetails();
  }, [attemptId, toast]);

  const handleGradeChange = (questionId, value) => {
    setGrades(prev => ({ ...prev, [questionId]: value }));
  };

  const handleGradeSubmission = async () => {
    try {
      await axios.post(`/api/assistant/quiz/attempt/${attemptId}/grade/`, { answers: grades });
      toast.push({ title: 'Succès', message: 'Le quiz a été noté.' });
      navigate('/assistant/a-corriger');
    } catch (err) {
      setError('Erreur lors de la soumission de la note.');
      toast.push({ title: 'Erreur', message: 'La notation a échoué.' });
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!attempt) return <p>Tentative non trouvée.</p>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/assistant/a-corriger" className="btn mb-4">{"<-"} Retour</Link>
      <h1 className="text-2xl font-bold mb-2">Correction du Quiz: {attempt.quiz_title}</h1>
      <p className="text-sm text-slate-500 mb-4">Soumis par {attempt.student_name} le {new Date(attempt.submitted_at).toLocaleString()}</p>

      {attempt.questions.map((q, index) => (
        <div key={q.question_id} className="card p-4 mb-4 bg-white dark:bg-slate-800">
          <p className="font-semibold">{index + 1}. {q.question_text}</p>
          
          {q.question_type === 'text' ? (
            <div className="mt-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Réponse de l'étudiant :</p>
              <p className="p-2 border rounded bg-slate-100 dark:bg-slate-700">{q.answer_text || "(Pas de réponse)"}</p>
              <div className="mt-2">
                <label className="text-sm">Points :</label>
                <input 
                  type="number" 
                  value={grades[q.question_id] || ''} 
                  onChange={(e) => handleGradeChange(q.question_id, e.target.value)} 
                  className="input ml-2 w-24"
                />
              </div>
            </div>
          ) : (
            <ul className="list-disc pl-5 mt-2">
              {q.choices.map(c => (
                <li key={c.id} className={`${c.is_correct ? 'text-green-500' : ''} ${c.is_selected ? 'font-bold' : ''}`}>
                  {c.text} {c.is_selected && !c.is_correct && "(Incorrect)"} {c.is_correct && "(Correct)"}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <button onClick={handleGradeSubmission} className="btn btn-primary">Soumettre la Correction</button>
    </div>
  );
}
