import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function AssistantQuizAttemptDetail() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [submission, setSubmission] = useState(null);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/assistant/quizzes/${quizId}/submission/${attemptId}/`);
        setSubmission(data);
        const initialGrades = {};
        data.quiz.questions.forEach(q => {
          if (q.question_type === 'text') {
            initialGrades[q.id] = data.answers[q.id]?.points_obtained || 0;
          }
        });
        setGrades(initialGrades);
      } catch (err) {
        setError('Impossible de charger les détails de la soumission.');
        toast.push({ title: 'Erreur', message: 'Impossible de charger les détails.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [quizId, attemptId, toast]);

  const handleGradeChange = (questionId, value) => {
    setGrades(prev => ({ ...prev, [questionId]: value }));
  };

  const handleGradeSubmission = async () => {
    try {
      const totalScore = Object.values(grades).reduce((acc, val) => acc + parseFloat(val || 0), 0);
      await axios.post(`/api/assistant/quizzes/${quizId}/attempt/${attemptId}/grade/`, { total_score: totalScore });
      toast.push({ title: 'Succès', message: 'Le quiz a été noté.' });
      navigate('/assistant/a-corriger');
    } catch (err) {
      setError('Erreur lors de la soumission de la note.');
      toast.push({ title: 'Erreur', message: 'La notation a échoué.' });
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!submission) return <p>Soumission non trouvée.</p>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/assistant/a-corriger" className="btn mb-4">{"<-"} Retour</Link>
      <h1 className="text-2xl font-bold mb-2">Correction du Quiz: {submission.quiz.title}</h1>
      <p className="text-sm text-slate-500 mb-4">Soumis par {submission.student_name} le {new Date(submission.submitted_at).toLocaleString()}</p>

      {submission.quiz.questions.map((q, index) => (
        <div key={q.id} className="card p-4 mb-4 bg-white dark:bg-slate-800">
          <p className="font-semibold">{index + 1}. {q.question_text}</p>
          
          {q.question_type === 'text' ? (
            <div className="mt-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Réponse de l'étudiant :</p>
              <p className="p-2 border rounded bg-slate-100 dark:bg-slate-700">{submission.answers[q.id] || "(Pas de réponse)"}</p>
              <div className="mt-2">
                <label className="text-sm">Points :</label>
                <input 
                  type="number" 
                  value={grades[q.id] || ''} 
                  onChange={(e) => handleGradeChange(q.id, e.target.value)} 
                  className="input ml-2 w-24"
                />
              </div>
            </div>
          ) : (
            <ul className="list-disc pl-5 mt-2">
              {q.choices.map(c => (
                <li key={c.id} className={`${c.is_correct ? 'text-green-500' : ''} ${submission.answers[q.id]?.includes(c.id) ? 'font-bold' : ''}`}>
                  {c.text} {submission.answers[q.id]?.includes(c.id) && !c.is_correct && "(Incorrect)"} {c.is_correct && "(Correct)"}
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
