import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeGet, safePost } from '../api/safeGet';
import { useToast } from '../shared/ToastProvider';

// Composant pour une seule question
function QuizQuestion({ question, answer, onAnswerChange, submitted }) {
  const handleChoiceChange = (choiceId) => {
    if (submitted) return;
    if (question.type === 'single') {
      onAnswerChange(question.id, choiceId);
    } else if (question.type === 'multiple') {
      const newAnswer = answer ? [...answer] : [];
      const choiceIndex = newAnswer.indexOf(choiceId);
      if (choiceIndex > -1) {
        newAnswer.splice(choiceIndex, 1);
      } else {
        newAnswer.push(choiceId);
      }
      onAnswerChange(question.id, newAnswer);
    }
  };

  const handleTextChange = (e) => {
    if (submitted) return;
    onAnswerChange(question.id, e.target.value);
  };

  return (
    <div className="card p-4 mb-4">
      <p className="font-semibold mb-3">{question.text}</p>
      {question.type === 'single' && question.choices.map(choice => (
        <div key={choice.id} className="flex items-center mb-2">
          <input
            type="radio"
            id={`q${question.id}-c${choice.id}`}
            name={`question-${question.id}`}
            value={choice.id}
            checked={answer === choice.id}
            onChange={() => handleChoiceChange(choice.id)}
            disabled={submitted}
            className="mr-2"
          />
          <label htmlFor={`q${question.id}-c${choice.id}`}>{choice.text}</label>
        </div>
      ))}
      {question.type === 'multiple' && question.choices.map(choice => (
        <div key={choice.id} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`q${question.id}-c${choice.id}`}
            value={choice.id}
            checked={answer?.includes(choice.id)}
            onChange={() => handleChoiceChange(choice.id)}
            disabled={submitted}
            className="mr-2"
          />
          <label htmlFor={`q${question.id}-c${choice.id}`}>{choice.text}</label>
        </div>
      ))}
      {question.type === 'text' && (
         <textarea
            value={answer || ''}
            onChange={handleTextChange}
            disabled={submitted}
            className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800"
            rows="3"
         />
      )}
    </div>
  );
}


export default function StudentQuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [submissionResult, setSubmissionResult] = useState(null);

  const fetchQuiz = async () => {
    setLoading(true);
    const data = await safeGet(`/api/quizzes/student/${id}/`);
    if (data) {
      setQuiz(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const res = await safePost(`/api/quizzes/student/attempts/${id}/submit/`, { answers });
    if (res) {
        toast.push({ title: "Succès", message: `Quiz soumis avec succès! Votre score: ${res.score}/${res.total_questions}` });
        setSubmissionResult(res);
        fetchQuiz(); // Re-fetch data to update UI
    } else {
        toast.push({ title: "Erreur", message: "Erreur lors de la soumission du quiz.", kind: 'error' });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Chargement du quiz...</div>;
  }

  if (!quiz) {
    return <div className="container mx-auto p-4">Quiz non trouvé.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-slate-600 dark:text-slate-400">Cours: {quiz.course_name}</p>
        <p className="text-slate-600 dark:text-slate-400">Par: {quiz.assistant_name}</p>
        <p className="text-slate-600 dark:text-slate-400">Durée: {quiz.duration} minutes</p>
        <p className="text-red-500 font-semibold">À passer avant le: {new Date(quiz.deadline).toLocaleString()}</p>
      </div>

      {submissionResult ? (
        <div className="card p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Résultats du Quiz</h2>
            <p className="text-4xl font-bold">{submissionResult.score} / {submissionResult.total_questions}</p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Votre score a été enregistré.</p>
            <button onClick={() => navigate('/etudiant/travaux', { state: { tab: 'quiz' } })} className="btn btn-secondary mt-4">Retour aux travaux</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {quiz.questions?.map(q => (
            <QuizQuestion
                key={q.id}
                question={q}
                answer={answers[q.id]}
                onAnswerChange={handleAnswerChange}
                submitted={!!submissionResult}
            />
            ))}

            <button type="submit" className="btn btn-primary w-full mt-4">
            Soumettre le quiz
            </button>
        </form>
      )}
    </div>
  );
}
