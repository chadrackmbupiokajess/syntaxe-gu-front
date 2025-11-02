import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function QuizCorrectionPage() {
  const { quiz_id, attempt_id } = useParams();
  const [quizDetails, setQuizDetails] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Données de démonstration (Mock Data) pour le développement frontend ---
  // REMPLACER CES DONNÉES PAR LES RÉSULTATS DE VOS APPELS API RÉELS
  const mockQuizData = {
    title: `Quiz ${quiz_id}: Introduction à la Physique Quantique`,
    total_questions: 3,
    questions: [
      { id: 1, text: "Quelle est la capitale de la France ?", type: "text", correct_answer: "Paris" },
      { id: 2, text: "2 + 2 = ?", type: "number", correct_answer: "4" },
      { id: 3, text: "Les oiseaux volent-ils ?", type: "boolean", correct_answer: "Oui" },
    ],
  };

  const mockAttemptData = {
    student_name: "Jean Dupont",
    submitted_at: "2023-10-27T10:30:00Z",
    answers: [
      { question_id: 1, student_answer: "Paris" },
      { question_id: 2, student_answer: "5" },
      { question_id: 3, student_answer: "Oui" },
    ],
  };
  // -------------------------------------------------------------------------

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        // --- REMPLACER CES APPELS AXIOS PAR VOS APPELS API RÉELS ---
        // const quizRes = await axios.get(`/api/quizzes/${quiz_id}`);
        // const attemptRes = await axios.get(`/api/quizzes/${quiz_id}/attempt/${attempt_id}`);

        // setQuizDetails(quizRes.data);
        // setAttemptDetails(attemptRes.data);

        // --- Utilisation des données de démonstration en attendant l'API réelle ---
        setQuizDetails(mockQuizData);
        setAttemptDetails(mockAttemptData);
        // -------------------------------------------------------------------------

      } catch (err) {
        console.error("Erreur lors du chargement des données du quiz:", err);
        setError("Impossible de charger les détails du quiz ou de la tentative. (Vérifiez votre API backend)");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quiz_id, attempt_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
        <p className="text-xl text-gray-600 dark:text-gray-300">Chargement des détails du quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Les données utilisées seront directement quizDetails et attemptDetails (qui sont maintenant les mock data)
  // Plus besoin de mockQuizDetails ou mockAttemptDetails conditionnels ici

  const handleGradeChange = (questionId, newGrade) => {
    // Logique pour mettre à jour la note d'une question
    console.log(`Question ${questionId}: Nouvelle note ${newGrade}`);
  };

  const handleSubmitCorrection = () => {
    // Logique pour soumettre la correction finale
    alert("Correction soumise !");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">Correction de Quiz</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">ID du Quiz: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{quiz_id}</span>, ID de la Tentative: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{attempt_id}</span></p>

        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{quizDetails.title}</h2>
          <p className="text-md text-gray-700 dark:text-gray-200">Étudiant: <span className="font-medium">{attemptDetails.student_name}</span></p>
          <p className="text-md text-gray-700 dark:text-gray-200">Soumis le: <span className="font-medium">{new Date(attemptDetails.submitted_at).toLocaleString()}</span></p>
        </div>

        <div className="space-y-6">
          {quizDetails.questions.map((question, index) => {
            const studentAnswerObj = attemptDetails.answers.find(ans => ans.question_id === question.id);
            const studentAnswer = studentAnswerObj ? studentAnswerObj.student_answer : "Pas de réponse";

            return (
              <div key={question.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Question {index + 1}: {question.text}</h3>
                <p className="text-md text-gray-700 dark:text-gray-200 mb-2">Votre réponse: <span className="font-medium text-indigo-600 dark:text-indigo-400">{String(studentAnswer)}</span></p>
                <p className="text-md text-gray-700 dark:text-gray-200 mb-4">Réponse correcte: <span className="font-medium text-green-600 dark:text-green-400">{String(question.correct_answer)}</span></p>

                <div className="flex items-center space-x-4">
                  <label htmlFor={`grade-${question.id}`} className="text-md text-gray-700 dark:text-gray-200">Note:</label>
                  <input
                    type="number"
                    id={`grade-${question.id}`}
                    min="0"
                    max="10"
                    defaultValue="0" // Valeur par défaut, à remplacer par la note existante si disponible
                    onChange={(e) => handleGradeChange(question.id, e.target.value)}
                    className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={handleSubmitCorrection}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Soumettre la Correction
          </button>
        </div>
      </div>
    </div>
  );
}
