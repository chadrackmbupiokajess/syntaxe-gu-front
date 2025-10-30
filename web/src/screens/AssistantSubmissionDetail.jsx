import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function AssistantSubmissionDetail() {
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`/api/assistant/tptd/${assignmentId}/submission/${submissionId}/`)
      .then(response => {
        setSubmission(response.data);
        setGrade(response.data.grade || '');
        setFeedback(response.data.feedback || '');
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching submission details:", error);
        toast.push({ kind: 'error', title: 'Erreur', message: 'Impossible de charger la soumission.' });
        setLoading(false);
      });
  }, [assignmentId, submissionId, toast]);

  const handleGradeSubmit = async () => {
    if (grade === '' || grade < 0 || grade > submission.assignment_total_points) {
      toast.push({ kind: 'error', title: 'Note invalide', message: `La note doit être entre 0 et ${submission.assignment_total_points}.` });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`/api/assistant/tptd/${assignmentId}/submission/${submissionId}/grade/`, {
        grade: parseFloat(grade),
        feedback,
      });
      toast.push({ title: 'Succès', message: 'La note a été enregistrée.' });
      navigate('/assistant/a-corriger');
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.push({ kind: 'error', title: 'Erreur', message: 'Impossible d\'enregistrer la note.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card p-4">Chargement de la soumission...</div>;
  }

  if (!submission) {
    return <div className="card p-4">Soumission non trouvée.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Colonne de gauche: Infos et notation */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Noter la Soumission</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Note</label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                  placeholder={`Note sur ${submission.assignment_total_points}`}
                />
                <span className="ml-2 text-slate-500">/ {submission.assignment_total_points}</span>
              </div>
            </div>
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Commentaires</label>
              <textarea
                id="feedback"
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                placeholder="Ajouter un commentaire pour l'étudiant..."
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button className="btn btn-lg w-full" onClick={handleGradeSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer la Note'}
          </button>
          <button className="btn btn-lg w-full !bg-slate-600" onClick={() => navigate('/assistant/a-corriger')}>
            Annuler
          </button>
        </div>
      </div>

      {/* Colonne de droite: Détails de la soumission */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Détails du Devoir</h3>
          <p><span className="font-semibold">Titre:</span> {submission.assignment_title}</p>
          <p><span className="font-semibold">Cours:</span> {submission.course_name}</p>
          <p><span className="font-semibold">Auditoire:</span> {submission.auditorium}</p>
        </div>

        {/* Nouvelle section pour le questionnaire */}
        {submission.assignment_questionnaire && submission.assignment_questionnaire.length > 0 && (
          <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Questionnaire du Devoir</h3>
            <div className="space-y-4">
              {submission.assignment_questionnaire.map((q, index) => (
                <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                  {/* Utilise q.text si disponible, sinon q.question pour la compatibilité */}
                  <p className="font-medium text-slate-700 dark:text-slate-300">Question {index + 1}: {q.text || q.question}</p>
                  {q.type !== 'text' && q.choices && q.choices.length > 0 && (
                    <ul className="list-disc list-inside ml-4 text-slate-600 dark:text-slate-400">
                      {q.choices.map((choice, cIndex) => (
                        <li key={cIndex} className={`${choice.is_correct ? 'font-semibold text-green-500' : ''}`}>
                          {choice.text} {choice.is_correct && '(Correct)'}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Informations sur l'Étudiant</h3>
          <p><span className="font-semibold">Nom:</span> {submission.student_name}</p>
          <p><span className="font-semibold">Soumis le:</span> {new Date(submission.submitted_at).toLocaleString()}</p>
        </div>
        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Contenu de la Soumission</h3>
          <div className="prose dark:prose-invert max-w-none">
            <p>{submission.content || 'Aucun contenu textuel soumis.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
