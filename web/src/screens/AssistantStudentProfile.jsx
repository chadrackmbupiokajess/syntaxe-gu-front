import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function AssistantStudentProfile() {
  const { studentId } = useParams();
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentCoursesAndGrades, setStudentCoursesAndGrades] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);

  useEffect(() => {
    // Fetch student details
    axios.get(`/api/assistant/students/${studentId}`)
      .then(r => setStudentDetails(r.data))
      .catch(error => console.error("Error fetching student details:", error));

    // Fetch student courses and grades
    axios.get(`/api/assistant/students/${studentId}/grades`)
      .then(r => setStudentCoursesAndGrades(r.data))
      .catch(error => console.error("Error fetching student courses and grades:", error));

    // Fetch student submissions
    axios.get(`/api/assistant/students/${studentId}/submissions`)
      .then(r => setStudentSubmissions(r.data))
      .catch(error => console.error("Error fetching student submissions:", error));
  }, [studentId]);

  if (!studentDetails || !studentCoursesAndGrades || !studentSubmissions) return <p>Chargement du profil étudiant...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Profil de l'étudiant : {studentDetails.name}</h2>
      
      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Informations générales</h3>
        <p><strong>ID :</strong> {studentDetails.id}</p>
        <p><strong>Email :</strong> {studentDetails.email}</p>
        <p><strong>Auditoire :</strong> {studentDetails.auditorium}</p>
        {studentDetails.total_possible_points > 0 && (
          <p><strong>Total points :</strong> {studentDetails.total_grade_obtained} / {studentDetails.total_possible_points}</p>
        )}
        {/* Ajoutez d'autres détails de l'étudiant ici */}
      </div>

      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Cours et Notes</h3>
        {studentCoursesAndGrades.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun cours ou note disponible pour cet étudiant.</p>
        ) : (
          <ul className="text-sm grid gap-2">
            {studentCoursesAndGrades.map((course, i) => (
              <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2 border-slate-200/60 dark:border-slate-800/60">
                <span className="font-medium">{course.name}</span>
                <span className="text-slate-500">Note : {course.grade || 'N/A'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Historique des soumissions</h3>
        {studentSubmissions.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune soumission enregistrée pour cet étudiant.</p>
        ) : (
          <ul className="text-sm grid gap-2">
            {studentSubmissions.map((submission, i) => (
              <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2 border-slate-200/60 dark:border-slate-800/60">
                <span className="font-medium">{submission.title}</span>
                <span className="text-slate-500">Statut : {submission.status} - Note : {submission.grade || 'N/A'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ajoutez d'autres sections comme la présence, la communication, etc. */}
    </div>
  );
}
