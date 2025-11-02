import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function QuizCorrectionPage() {
  const { quiz_id, attempt_id } = useParams();
  const [quizDetails, setQuizDetails] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionGrades, setQuestionGrades] = useState({}); // Nouvel état pour stocker les notes par question

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quizRes = await axios.get(`/api/quizzes/my/${quiz_id}`);
        console.log("Quiz data received:", quizRes.data);
        setQuizDetails(quizRes.data);

        // TODO: Implémenter l'appel API réel pour les détails de la tentative pour un assistant
        // Pour l'instant, nous utilisons un placeholder ou une structure vide si non disponible
        // const attemptRes = await axios.get(`/api/quizzes/${quiz_id}/attempt/${attempt_id}`);
        // setAttemptDetails(attemptRes.data);
        const mockAttempt = { student_name: "Étudiant Inconnu", submitted_at: new Date().toISOString(), answers: [] };
        setAttemptDetails(mockAttempt);

        // Initialiser les notes des questions une fois que les détails du quiz sont chargés
        if (quizRes.data && quizRes.data.questionnaire) {
          const initialGrades = {};
          quizRes.data.questionnaire.forEach(q => {
            // Utiliser l'ID de la question comme clé
            initialGrades[q.id] = 0; // Par défaut à 0
          });
          setQuestionGrades(initialGrades);
        }

      } catch (err) {
        console.error("Erreur lors du chargement des données du quiz:", err);
        setError("Impossible de charger les détails du quiz ou de la tentative. Veuillez vérifier le backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quiz_id, attempt_id]);

  // Calcul de la note totale
  const totalScore = Object.values(questionGrades).reduce((sum, grade) => sum + parseFloat(grade || 0), 0);

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

  // Afficher un message si quizDetails n'est pas encore chargé ou si les questions sont manquantes
  if (!quizDetails || !quizDetails.questionnaire || !attemptDetails) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
        <p className="text-xl text-gray-600 dark:text-gray-300">Aucune donnée de quiz ou de tentative trouvée, ou les questions sont manquantes.</p>
      </div>
    );
  }

  const handleGradeChange = (questionId, newGrade) => {
    setQuestionGrades(prevGrades => ({
      ...prevGrades,
      [questionId]: newGrade,
    }));
  };

  const handleSubmitCorrection = async () => {
    console.log("Correction soumise:", {
      quiz_id,
      attempt_id,
      grades: questionGrades,
      total_score: totalScore,
    });

    try {
      // TODO: Implémenter cet endpoint backend pour enregistrer les corrections
      await axios.post(`/api/assistant/quizzes/${quiz_id}/attempt/${attempt_id}/grade`, {
        grades: questionGrades,
        total_score: totalScore,
      });
      alert("Correction soumise avec succès !");
    } catch (submitError) {
      console.error("Erreur lors de la soumission de la correction:", submitError);
      alert("Erreur lors de la soumission de la correction. Veuillez vérifier le backend.");
    }
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
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-4">Note Totale: <span className="text-indigo-600 dark:text-indigo-400">{totalScore}</span></p>
        </div>

        <div className="space-y-6">
          {quizDetails.questionnaire.map((question, index) => {
            // Utiliser question.id pour la correspondance des réponses de l'étudiant
            const studentAnswerObj = attemptDetails.answers.find(ans => ans.question_id === question.id);
            const studentAnswer = studentAnswerObj ? studentAnswerObj.student_answer : "Pas de réponse";

            return (
              <div key={question.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Question {index + 1}: {question.question}</h3>
                <p className="text-md text-gray-700 dark:text-gray-200 mb-2">Votre réponse: <span className="font-medium text-indigo-600 dark:text-indigo-400">{String(studentAnswer)}</span></p>
                {/* La réponse correcte n'est pas fournie par l'API actuelle */}
                {/* <p className="text-md text-gray-700 dark:text-gray-200 mb-4">Réponse correcte: <span className="font-medium text-green-600 dark:text-green-400">{String(question.correct_answer)}</span></p> */}

                <div className="flex items-center space-x-4">
                  <label htmlFor={`grade-${question.id}`} className="text-md text-gray-700 dark:text-gray-200">Note:</label>
                  <input
                    type="number"
                    id={`grade-${question.id}`}
                    min="0"
                    max={question.points || 10} // Utilise les points de la question comme max, sinon 10
                    value={questionGrades[question.id] || 0} // Utilise la note de l'état ou 0 par défaut
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
