import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider'; // Import useToast

export default function QuizCorrectionPage() {
  const { quiz_id, attempt_id } = useParams();
  const navigate = useNavigate(); // Import and use navigate
  const toast = useToast(); // Import and use toast
  const [quizDetails, setQuizDetails] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Simplified state for the total score
  const [totalScore, setTotalScore] = useState('');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quizRes = await axios.get(`/api/quizzes/my/${quiz_id}`);
        setQuizDetails(quizRes.data);

        // TODO: Replace with a real API call to get attempt details, including student answers and existing score
        const mockAttempt = { 
            student_name: "Étudiant Placeholder", 
            submitted_at: new Date().toISOString(), 
            answers: quizRes.data.questionnaire.map(q => ({ question_id: q.id, student_answer: "Réponse de l'étudiant..." })),
            score: null // Assuming no score initially
        };
        setAttemptDetails(mockAttempt);
        setTotalScore(mockAttempt.score || '');

      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les détails. Veuillez vérifier le backend.");
        toast.push({ kind: 'error', title: 'Erreur', message: 'Impossible de charger les détails.' });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quiz_id, attempt_id, toast]);

  const handleSubmitCorrection = async () => {
    if (totalScore === '' || totalScore < 0 || totalScore > quizDetails.total_points) {
      toast.push({ kind: 'error', title: 'Note invalide', message: `La note doit être entre 0 et ${quizDetails.total_points}.` });
      return;
    }
    setSaving(true);
    try {
      // The backend endpoint was simplified to only take total_score
      await axios.post(`/api/assistant/quizzes/${quiz_id}/attempt/${attempt_id}/grade/`, {
        total_score: parseFloat(totalScore),
      });
      toast.push({ title: 'Succès', message: 'La note a été enregistrée.' });
      navigate('/assistant/a-corriger'); // Redirect after successful submission
    } catch (submitError) {
      console.error("Erreur lors de la soumission de la correction:", submitError);
      toast.push({ kind: 'error', title: 'Erreur', message: 'Impossible d\'enregistrer la note.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card p-4">Chargement...</div>;
  }

  if (error || !quizDetails || !attemptDetails) {
    return <div className="card p-4">{error || "Données non trouvées."}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Colonne de gauche: Infos et notation */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Noter le Quiz</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Note Globale</label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  id="grade"
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                  placeholder={`Note sur ${quizDetails.total_points}`}
                />
                <span className="ml-2 text-slate-500">/ {quizDetails.total_points}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button className="btn btn-lg w-full" onClick={handleSubmitCorrection} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer la Note'}
          </button>
          <button className="btn btn-lg w-full !bg-slate-600" onClick={() => navigate('/assistant/a-corriger')}>
            Annuler
          </button>
        </div>
      </div>

      {/* Colonne de droite: Détails du quiz et réponses */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Détails du Quiz</h3>
          <p><span className="font-semibold">Titre:</span> {quizDetails.title}</p>
          <p><span className="font-semibold">Cours:</span> {quizDetails.course_name}</p>
          <p><span className="font-semibold">Étudiant:</span> {attemptDetails.student_name}</p>
          <p><span className="font-semibold">Soumis le:</span> {new Date(attemptDetails.submitted_at).toLocaleString()}</p>
        </div>

        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Questions et Réponses de l'Étudiant</h3>
          <div className="space-y-4">
            {quizDetails.questionnaire.map((question, index) => {
              const studentAnswerObj = attemptDetails.answers.find(ans => ans.question_id === question.id);
              const studentAnswer = studentAnswerObj ? studentAnswerObj.student_answer : "Pas de réponse";

              return (
                <div key={question.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Question {index + 1}: {question.question}</p>
                  <p className="text-md text-gray-700 dark:text-gray-200 mb-2">Réponse: <span className="font-medium text-indigo-600 dark:text-indigo-400">{String(studentAnswer)}</span></p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
