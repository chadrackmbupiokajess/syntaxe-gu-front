import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [error, setError] = useState(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/assistant/tptd/${assignmentId}/submission/${submissionId}/`);
        setSubmission(data);
        setGrade(data.grade || ''); // Pre-fill if already graded
        setFeedback(data.feedback || ''); // Pre-fill if already graded
      } catch (err) {
        setError('Impossible de charger les détails de la soumission.');
        console.error(err);
        toast.push({ title: 'Erreur', message: 'Impossible de charger les détails de la soumission.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [assignmentId, submissionId, toast]);

  const handleGradeSubmission = async () => {
    setIsSubmittingGrade(true);
    try {
      await axios.post(`/api/assistant/tptd/${assignmentId}/submission/${submissionId}/grade/`, {
        grade: grade,
        feedback: feedback,
      });
      toast.push({ title: 'Succès', message: 'Note et commentaires soumis avec succès.' });
      navigate('/assistant/to-grade'); // Navigate back to the to-grade list
    } catch (err) {
      setError('Erreur lors de la soumission de la note.');
      console.error(err);
      toast.push({ title: 'Erreur', message: 'Erreur lors de la soumission de la note.' });
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex items-center justify-center"><p className="text-xl">Chargement des détails de la soumission...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex items-center justify-center"><p className="text-xl text-red-400">{error}</p></div>;
  }

  if (!submission) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex items-center justify-center"><p className="text-xl">Aucune soumission trouvée.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/assistant/to-grade" className="btn bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Retour aux corrections
          </Link>
          <h1 className="text-3xl font-extrabold ml-4 text-indigo-400">Correction de la soumission</h1>
        </div>

        <div className="bg-slate-800 shadow-lg rounded-lg overflow-hidden mb-6 p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-indigo-300 mb-4">
            Soumission de <span className="text-white"> {submission.student_name}</span> pour "<span className="text-white"> {submission.assignment_title}</span>"
          </h2>
          <div className="text-sm text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <p><strong>Cours :</strong> <span className="text-slate-200"> {submission.course_name}</span></p>
            <p><strong>Auditoire :</strong> <span className="text-slate-200"> {submission.auditorium}</span></p>
            <p><strong>Département :</strong> <span className="text-slate-200"> {submission.department}</span></p>
            <p><strong>Soumis le :</strong> <span className="text-slate-200"> {new Date(submission.submitted_at).toLocaleString()}</span></p>
            {submission.graded_at && <p><strong>Corrigé le :</strong> <span className="text-slate-200"> {new Date(submission.graded_at).toLocaleString()}</span></p>}
            <p><strong>Statut :</strong> <span className={`font-semibold ${submission.status === 'noté' ? 'text-green-400' : 'text-yellow-400'}`}> {submission.status}</span></p>
          </div>
        </div>

        <div className="bg-slate-800 shadow-lg rounded-lg overflow-hidden mb-6 p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-indigo-300 mb-3">Questionnaire de l'assignation</h3>
          {submission.assignment_questionnaire && submission.assignment_questionnaire.length > 0 ? (
            <ul className="list-decimal pl-5 space-y-3 text-slate-300">
              {submission.assignment_questionnaire.map((q, index) => (
                <li key={index} className="bg-slate-700 p-3 rounded-md">
                  <p className="whitespace-pre-wrap font-medium">{q.question}</p>
                  <p className="text-sm text-slate-400">({q.points} points)</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">Aucune question définie pour cette assignation.</p>
          )}
        </div>

        <div className="bg-slate-800 shadow-lg rounded-lg overflow-hidden mb-6 p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-indigo-300 mb-3">Contenu de la soumission de l'étudiant</h3>
          <div className="whitespace-pre-wrap p-4 border border-slate-600 rounded-md bg-slate-900 text-slate-200 min-h-[150px]">
            {submission.content || "L'étudiant n'a pas fourni de contenu."}
          </div>
        </div>

        <div className="bg-slate-800 shadow-lg rounded-lg overflow-hidden p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-indigo-300 mb-3">Notation et commentaires</h3>
          <div className="mb-4">
            <label htmlFor="grade" className="block text-sm font-medium text-slate-300 mb-1">Note (/ {submission.assignment_total_points})</label>
            <input
              type="number"
              id="grade"
              className="mt-1 block w-full p-3 rounded-md bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max={submission.assignment_total_points}
              placeholder="Entrez la note..."
            />
          </div>
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-sm font-medium text-slate-300 mb-1">Commentaires</label>
            <textarea
              id="feedback"
              className="mt-1 block w-full p-3 rounded-md bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500"
              rows="5"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Entrez vos commentaires pour l'étudiant..."
            ></textarea>
          </div>
          <button
            className="w-full sm:w-auto mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGradeSubmission}
            disabled={isSubmittingGrade}
          >
            {isSubmittingGrade ? 'Soumission en cours...' : 'Soumettre la note'}
          </button>
        </div>
      </div>
    </div>
  );
}
