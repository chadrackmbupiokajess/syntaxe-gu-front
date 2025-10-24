import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function AssistantAuditoriumDetails() {
  const { code } = useParams();
  const [auditoriumDetails, setAuditoriumDetails] = useState(null);
  const [students, setStudents] = useState(null);
  const [auditoriumStats, setAuditoriumStats] = useState(null);
  const [auditoriumActivities, setAuditoriumActivities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const studentsRef = useRef(null);
  const activitiesRef = useRef(null);

  useEffect(() => {
    const fetchAuditoriumData = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch students
        try {
          const studentsResponse = await axios.get(`/api/assistant/auditoriums/${code}/students`);
          setStudents(studentsResponse.data);
        } catch (err) {
          console.error("Error fetching students:", err);
          setError(true);
          // Removed mock data for students
        }

        // Fetch statistics
        try {
          const statsResponse = await axios.get(`/api/assistant/auditoriums/${code}/stats`);
          setAuditoriumStats(statsResponse.data);
        } catch (err) {
          console.error("Error fetching auditorium stats:", err);
          setError(true);
          // Removed mock data for stats
        }

        // Fetch activities
        try {
          const activitiesResponse = await axios.get(`/api/assistant/auditoriums/${code}/activities`);
          setAuditoriumActivities(activitiesResponse.data);
        } catch (err) {
          console.error("Error fetching auditorium activities:", err);
          setError(true);
          // Removed mock data for activities
        }

      } finally {
        setLoading(false);
      }
    };

    fetchAuditoriumData();
  }, [code]);

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <p className="text-gray-700 p-8">Chargement...</p>;
  if (error) return <p className="text-red-500 p-8">Certaines données n'ont pas pu être chargées. Veuillez vérifier votre connexion ou réessayer.</p>;

  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Détails de l'auditoire : {code}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Actions rapides */}
        <div className="card p-4 lg:col-span-1">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Actions rapides</h3>
          <div className="flex flex-col gap-3">
            <Link to={`/assistant/auditoires/${code}/message`} className="btn">Envoyer un message</Link>
            <Link to={`/assistant/auditoires/${code}/tptd/new`} className="btn">Ajouter un TP/TD</Link>
            <Link to={`/assistant/auditoires/${code}/quizzes/new`} className="btn">Créer un quiz</Link>
            <button onClick={() => scrollToRef(activitiesRef)} className="btn">Voir l'historique des activités</button>
          </div>
        </div>

        {/* Statistiques de l'auditoire */}
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Statistiques de l'auditoire</h3>
          {auditoriumStats ? (
            <ul className="grid gap-3">
              <li className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-700">Moyenne des notes (générale) :</span>
                <span className="text-gray-600 font-semibold">{auditoriumStats.averageGrade || 'N/A'}</span>
              </li>
              <li className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-700">Nombre d'étudiants :</span>
                <span className="text-gray-600 font-semibold">{auditoriumStats.totalStudents || (students ? students.length : 'N/A')}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Taux de réussite :</span>
                <span className="text-gray-600 font-semibold">{auditoriumStats.passRate || 'N/A'}</span>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Aucune statistique disponible pour cet auditoire.</p>
          )}
        </div>
      </div>

      {/* Historique des activités */}
      <div ref={activitiesRef} className="card p-4 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Historique des activités</h3>
        {auditoriumActivities && auditoriumActivities.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune activité récente pour cet auditoire.</p>
        ) : (
          <ul className="grid gap-3">
            {auditoriumActivities && auditoriumActivities.map((activity, i) => (
              <li key={i} className="flex items-center justify-between border rounded-lg px-4 py-3 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                <div>
                  <span className="font-medium text-gray-700">{activity.title}</span>
                  <p className="text-xs text-gray-500">{activity.type}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Étudiants */}
      <div ref={studentsRef} className="card p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Étudiants (
          <button onClick={() => scrollToRef(studentsRef)} className="text-blue-600 hover:underline">
            {students ? students.length : 'N/A'}
          </button>
          )
        </h3>
        {students && students.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun étudiant dans cet auditoire.</p>
        ) : (
          <ul className="grid gap-3">
            {students && students.map((student, i) => (
              <Link to={`/assistant/students/${student.id}`} key={i}>
                <li className="flex items-center justify-between border rounded-lg px-4 py-3 border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  <div>
                    <span className="font-medium text-gray-700">{student.name}</span>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  {/* Vous pouvez ajouter plus de détails sur l'étudiant ici */}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
