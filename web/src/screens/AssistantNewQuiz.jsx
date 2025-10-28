import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

// --- Helper: Icon Components ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
);


export default function AssistantNewQuiz() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', course_code: '', auditorium_id: '', duration: 20, total_points: 20, questions: [] });
  const [auditoriums, setAuditoriums] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: auds } = await axios.get('/api/auditoriums/assistant/my/');
      setAuditoriums(auds);
      if (auds[0] && !form.auditorium_id) {
        setForm(f => ({ ...f, auditorium_id: auds[0].id }));
      }
      const { data: courses } = await axios.get('/api/assistant/courses/');
      setAllCourses(courses);
    };
    fetchInitialData();
  }, []);

  const courses = useMemo(() => {
    if (!form.auditorium_id) return [];
    return allCourses.filter(c => c.auditorium_id === Number(form.auditorium_id));
  }, [form.auditorium_id, allCourses]);

  useEffect(() => {
    if (courses.length > 0) {
      setForm(f => ({ ...f, course_code: courses[0].code }));
    } else {
      setForm(f => ({ ...f, course_code: '' }));
    }
  }, [courses]);

  const handleQuestionChange = (q_index, field, value) => {
    const newQuestions = [...form.questions];
    newQuestions[q_index][field] = value;
    setForm({ ...form, questions: newQuestions });
  };

  const handleChoiceChange = (q_index, c_index, field, value) => {
    const newQuestions = [...form.questions];
    const question = newQuestions[q_index];

    if (field === 'is_correct') {
        if (question.type === 'single') {
            // Radio button logic: only one can be correct
            question.choices.forEach((choice, i) => {
                choice.is_correct = i === c_index;
            });
        } else {
            // Checkbox logic: toggle the value
            question.choices[c_index].is_correct = !question.choices[c_index].is_correct;
        }
    } else {
        // Handle text change
        question.choices[c_index][field] = value;
    }
    setForm({ ...form, questions: newQuestions });
  };

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { text: '', type: 'single', choices: [{text: '', is_correct: true}] }] });
  };

  const removeQuestion = (q_index) => {
    const newQuestions = [...form.questions];
    newQuestions.splice(q_index, 1);
    setForm({ ...form, questions: newQuestions });
  };

  const addChoice = (q_index) => {
    const newQuestions = [...form.questions];
    newQuestions[q_index].choices.push({ text: '', is_correct: false });
    setForm({ ...form, questions: newQuestions });
  };

  const removeChoice = (q_index, c_index) => {
    const newQuestions = [...form.questions];
    newQuestions[q_index].choices.splice(c_index, 1);
    setForm({ ...form, questions: newQuestions });
  };

  const createQuiz = async () => {
    if (!form.title || !form.course_code || form.questions.length === 0) {
      toast.push({ kind: 'error', title: 'Champs requis', message: 'Titre, cours et au moins une question sont requis.' });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/quizzes/my/', form);
      const newQuizIds = JSON.parse(sessionStorage.getItem('newQuizIds') || '[]');
      newQuizIds.push(response.data.id);
      sessionStorage.setItem('newQuizIds', JSON.stringify(newQuizIds));

      toast.push({ title: 'Quiz créé avec succès' });
      navigate('/assistant/quizzes');
    } catch (error) {
      toast.push({ kind: 'error', title: 'Erreur de création', message: error?.response?.data?.detail || 'Une erreur est survenue.' });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Left Column: Metadata & Actions --- */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card bg-white dark:bg-slate-800 p-5 shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Paramètres du Quiz</h2>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Titre du Quiz
                    <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Ex: Introduction à l'IA" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Durée (min)
                        <input type="number" min="5" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
                    </label>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Point total
                        <input type="number" min="0" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.total_points} onChange={e => setForm({ ...form, total_points: Number(e.target.value) })} />
                    </label>
                </div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Auditoire
                    <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.auditorium_id} onChange={e => setForm({ ...form, auditorium_id: e.target.value })}> 
                    {auditoriums.map(a => <option key={a.id} value={a.id}>{a.name} - {a.department}</option>)}
                    </select>
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Cours
                    <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value })}> 
                    {courses.map(c => <option key={c.code} value={c.code}>{c.code} • {c.title}</option>)}
                    </select>
                </label>
            </div>
        </div>
        <div className="flex flex-col gap-3">
            <button className="btn btn-lg w-full" onClick={createQuiz} disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer le Quiz'}</button>
            <button className="btn btn-lg w-full !bg-slate-600" onClick={() => navigate('/assistant/quizzes')}>Annuler</button>
        </div>
      </div>

      {/* --- Right Column: Questions Builder --- */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Questions du Quiz</h2>
            <button className="btn inline-flex items-center" onClick={addQuestion}><PlusCircleIcon /> Ajouter une question</button>
        </div>

        {form.questions.map((q, q_index) => (
            <div key={q_index} className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800 dark:text-white">Question {q_index + 1}</p>
                    <button className="text-red-500 hover:text-red-400" onClick={() => removeQuestion(q_index)}><TrashIcon /></button>
                </div>
                <textarea className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Texte de la question..." value={q.text} onChange={e => handleQuestionChange(q_index, 'text', e.target.value)} />
                <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={q.type} onChange={e => handleQuestionChange(q_index, 'type', e.target.value)}>
                    <option value="single">Choix unique</option>
                    <option value="multiple">Choix multiple</option>
                    <option value="text">Texte libre</option>
                </select>

                {q.type !== 'text' && (
                    <div className="mt-3 pl-4 border-l-2 border-slate-300 dark:border-slate-600 space-y-3">
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Choix de réponse</h5>
                        {q.choices.map((c, c_index) => (
                            <div key={c_index} className="flex items-center gap-3">
                                <input
                                    type={q.type === 'single' ? 'radio' : 'checkbox'}
                                    name={`q_${q_index}_correct`}
                                    checked={c.is_correct}
                                    onChange={() => handleChoiceChange(q_index, c_index, 'is_correct')}
                                    className={`${q.type === 'single' ? 'radio' : 'checkbox'} radio-primary checkbox-primary`}
                                />
                                <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder={`Choix ${c_index + 1}`} value={c.text} onChange={e => handleChoiceChange(q_index, c_index, 'text', e.target.value)} />
                                <button className="text-slate-400 hover:text-red-500" onClick={() => removeChoice(q_index, c_index)}><TrashIcon /></button>
                            </div>
                        ))}
                        <button className="btn btn-sm mt-2 inline-flex items-center" onClick={() => addChoice(q_index)}><PlusCircleIcon/>Ajouter un choix</button>
                    </div>
                )}
            </div>
        ))}
        {form.questions.length === 0 && <p className="text-center text-slate-500 py-8">Commencez par ajouter une question.</p>}
      </div>
    </div>
  );
}
