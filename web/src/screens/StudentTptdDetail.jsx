import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function StudentTptdDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [assignment, setAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data } = await axios.get(`/api/tptd/student/${id}/`);
        setAssignment(data);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast.push({ title: 'Erreur', message: 'Impossible de charger le devoir.' });
      }
    };
    fetchAssignment();
  }, [id, toast]);

  const handleSubmission = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`/api/tptd/student/${id}/submit/`, { content: submissionContent });
      toast.push({ title: 'Succès', message: 'Votre travail a été soumis.' });
      // Optionally, you could redirect the user or update the UI
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.push({ title: 'Erreur', message: 'La soumission a échoué.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) {
    return <p>Chargement du devoir...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{assignment.title}</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <p><strong>Cours :</strong> {assignment.course_name}</p>
            <p><strong>À rendre avant le :</strong> {new Date(assignment.deadline).toLocaleString()}</p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-6">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Questionnaire</h2>
            <div dangerouslySetInnerHTML={{ __html: assignment.questionnaire }} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Soumettre votre travail</h2>
            <textarea
              className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
              rows="5"
              placeholder="Entrez votre réponse ou le lien vers votre travail ici..."
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
            ></textarea>
            <button
              className="btn mt-4 w-full sm:w-auto"
              onClick={handleSubmission}
              disabled={isSubmitting || !submissionContent}
            >
              {isSubmitting ? 'Soumission en cours...' : 'Soumettre le devoir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
