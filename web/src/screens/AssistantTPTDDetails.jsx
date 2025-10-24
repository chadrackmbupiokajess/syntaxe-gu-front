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

export default function AssistantTPTDDetails() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/tptd/my/${id}/`);
        setAssignment(data);
      } catch (err) {
        setError('Impossible de charger les détails du travail.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchAssignment();
  }, [id]);

  if (loading) {
    return <div className="card p-4">Chargement...</div>;
  }

  if (error) {
    return <div className="card p-4 text-red-500">{error}</div>;
  }

  if (!assignment) {
    return <div className="card p-4">Aucun détail trouvé pour ce travail.</div>;
  }

  return (
    <div className="grid gap-6">
        <div className="flex items-center">
            <Link to="/assistant/tptd" className="btn btn-sm mr-4">{"<-"} Retour</Link>
            <h1 className="text-2xl font-bold">Détails du {assignment.type}</h1>
        </div>
      
      <div className="card p-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">{assignment.title}</h2>
          <div className="space-y-4">
            <h3 className="font-semibold">Questionnaire</h3>
            {assignment.questionnaire && assignment.questionnaire.length > 0 ? (
              <ul className="list-decimal pl-5 space-y-3">
                {assignment.questionnaire.map((q, index) => (
                  <li key={index}>
                    <p className="whitespace-pre-wrap">{q.question}</p>
                    <p className="text-sm text-slate-500">({q.points} points)</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune question définie pour ce travail.</p>
            )}
          </div>
        </div>
        <div className="space-y-3 text-sm">
            <p><strong>Cours:</strong> {assignment.course_name}</p>
            <p><strong>Auditoire:</strong> {assignment.auditorium}</p>
            <p><strong>Département:</strong> {assignment.department}</p>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <p><strong>Cote totale:</strong> <span className="font-bold">/ {assignment.total_points}</span></p>
            <hr className="border-slate-200 dark:border-slate-700"/>
            <p><strong>Créé le:</strong> {formatDate(assignment.created_at)}</p>
            <p><strong>Date de remise:</strong> <span className="font-semibold text-red-500">{formatDate(assignment.deadline)}</span></p>
        </div>
      </div>

      {/* Placeholder for submissions list */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Soumissions des étudiants</h3>
        <p className="text-slate-500">La liste des soumissions sera bientôt disponible ici.</p>
      </div>
    </div>
  );
}
