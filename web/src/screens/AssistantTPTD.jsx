import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useToast } from '../shared/ToastProvider'
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
  let formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
  formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1).replace('.', '');
  return formattedDate.replace(/\//g, '-');
};

const abbreviateAuditorium = (auditoriumName) => {
  const match = auditoriumName.match(/Licence (\d)/);
  if (match && match[1]) return `L${match[1]}`;
  if (auditoriumName.startsWith('G') && !isNaN(auditoriumName.charAt(1))) return auditoriumName.split(' ')[0];
  return auditoriumName;
};

export default function AssistantTPTD() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ title: '', type: 'TP', course_code: '', auditorium_id: '', deadlineLocal: '', questionnaire: [], total_points: 20 })
  const [auditoriums, setAuditoriums] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [openSections, setOpenSections] = useState({});
  const [newlyCreatedIds, setNewlyCreatedIds] = useState(new Set());

  const load = async () => { const { data } = await axios.get('/api/tptd/my/'); setRows(data) }
  useEffect(() => { load() }, [])

  useEffect(() => {
    const fetchAud = async () => {
      const { data } = await axios.get('/api/auditoriums/assistant/my/')
      setAuditoriums(data)
      if (data[0] && !form.auditorium_id) setForm(f => ({ ...f, auditorium_id: data[0].id }))
    }
    fetchAud()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      if (!form.auditorium_id) { setCourses([]); return }
      const { data } = await axios.get(`/api/assistant/auditoriums/${form.auditorium_id}/courses`)
      setCourses(data)
      if (data[0] && !form.course_code) setForm(f => ({ ...f, course_code: data[0].code }))
    }
    fetchCourses()
  }, [form.auditorium_id])

  const groupedData = useMemo(() => {
    return rows.reduce((acc, row) => {
      const { department, auditorium } = row;
      if (!acc[department]) {
        acc[department] = {};
      }
      if (!acc[department][auditorium]) {
        acc[department][auditorium] = [];
      }
      acc[department][auditorium].push(row);
      return acc;
    }, {});
  }, [rows]);

  const toggleSection = (key, level, idsToMarkAsSeen = []) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    if (level === 'auditorium' && !openSections[key] && idsToMarkAsSeen.length > 0) {
      setNewlyCreatedIds(prev => {
        const newSet = new Set(prev);
        idsToMarkAsSeen.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };
  
  const handleQuestionChange = (index, field, value) => {
    const newQuestionnaire = [...form.questionnaire];
    newQuestionnaire[index][field] = value;
    setForm({ ...form, questionnaire: newQuestionnaire });
  };

  const addQuestion = () => {
    setForm({ ...form, questionnaire: [...form.questionnaire, { type: 'text', question: '', points: 10 }] });
  };

  const removeQuestion = (index) => {
    const newQuestionnaire = [...form.questionnaire];
    newQuestionnaire.splice(index, 1);
    setForm({ ...form, questionnaire: newQuestionnaire });
  };

  const createItem = async () => {
    if (!form.title || !form.course_code || !form.auditorium_id) {
      toast.push({ kind: 'error', title: 'Champs requis', message: 'Titre, Auditoire et Code du cours sont requis.' })
      return
    }
    const payload = {
      title: form.title,
      type: form.type,
      course_code: form.course_code,
      auditorium_id: form.auditorium_id,
      questionnaire: form.questionnaire,
      total_points: form.total_points,
      deadline: form.deadlineLocal ? new Date(form.deadlineLocal).toISOString() : ''
    }
    setLoading(true)
    try {
        const { data: newAssignment } = await axios.post('/api/tptd/my/', payload);
        setRows(prevRows => [...prevRows, newAssignment]);
        setNewlyCreatedIds(prev => new Set(prev).add(newAssignment.id));
        setForm({ title: '', type: 'TP', course_code: '', auditorium_id: form.auditorium_id, deadlineLocal: '', questionnaire: [], total_points: 20 });
        toast.push({ title: 'TP/TD créé avec succès' });
    } catch (error) {
        toast.push({ kind: 'error', title: 'Erreur de création', message: error?.response?.data?.detail || 'Une erreur est survenue.' })
    }
    setLoading(false)
  }
  
  const del = async (id) => {
    await axios.delete(`/api/tptd/my/${id}/`)
    await load()
    toast.push({ title: 'TP/TD supprimé' })
  }

  return (
    <div className="grid gap-4">
      <div className="card p-4 grid gap-2">
        <h3 className="text-lg font-semibold">Nouveau TP/TD</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">Titre
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Ex: TP Réseaux: sockets" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          </label>
          <label className="text-sm">Type
            <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option>TP</option><option>TD</option>
            </select>
          </label>
          <label className="text-sm">Auditoire
            <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.auditorium_id} onChange={e=>setForm({...form,auditorium_id:e.target.value, course_code: ''})}>
              {auditoriums.map(a => (
                <option key={a.id} value={a.id}>
                  {`${abbreviateAuditorium(a.name)} ° ${a.department}`}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">Code du cours
            <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.course_code} onChange={e=>setForm({...form,course_code:e.target.value})}>
              {courses.map(c => (
                <option key={c.code} value={c.code}>{c.code} • {c.title}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">Date de remise
            <input type="datetime-local" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.deadlineLocal} onChange={e=>setForm({...form,deadlineLocal:e.target.value})} />
          </label>
          <label className="text-sm">Cote
            <input type="number" className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.total_points} onChange={e=>setForm({...form,total_points:e.target.value})} />
          </label>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold">Questions</h4>
          {form.questionnaire.map((q, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center mt-2">
              <textarea 
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" 
                placeholder={`Question ${index + 1}`}
                value={q.question}
                onChange={e => handleQuestionChange(index, 'question', e.target.value)}
              />
              <input 
                type="number"
                className="w-20 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                value={q.points}
                onChange={e => handleQuestionChange(index, 'points', e.target.value)}
              />
              <button className="btn !bg-red-600" onClick={() => removeQuestion(index)}>X</button>
            </div>
          ))}
          <button className="btn mt-2" onClick={addQuestion}>Ajouter une question</button>
        </div>
        <div>
          <button className="btn" onClick={createItem} disabled={loading}>{loading ? 'Création...' : 'Créer'}</button>
        </div>
      </div>

      <div className="card p-4 grid gap-2">
        <h3 className="text-lg font-semibold mb-2">Mes TP/TD</h3>
        {Object.entries(groupedData).map(([department, auditoriums]) => {
          const newInDeptCount = Object.values(auditoriums).flat().filter(item => newlyCreatedIds.has(item.id)).length;
          return (
            <div key={department} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 py-2">
              <button onClick={() => toggleSection(department, 'department')} className="w-full text-left font-semibold text-lg flex justify-between items-center">
                <span className="flex items-center">
                  {department}
                  {newInDeptCount > 0 && <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newInDeptCount}</span>}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[department] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {openSections[department] && (
                <div className="pl-4 mt-2 grid gap-2">
                  {Object.entries(auditoriums).map(([auditorium, tptdList]) => {
                    const newInAuditoriumCount = tptdList.filter(item => newlyCreatedIds.has(item.id)).length;
                    const idsInAuditorium = tptdList.map(item => item.id);
                    return (
                      <div key={auditorium} className="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <button onClick={() => toggleSection(auditorium, 'auditorium', idsInAuditorium)} className="w-full text-left font-medium text-md flex justify-between items-center">
                          <span className="flex items-center">
                            {auditorium}
                            {newInAuditoriumCount > 0 && <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newInAuditoriumCount}</span>}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[auditorium] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                        {openSections[auditorium] && (
                          <div className="overflow-auto mt-2">
                            <table className="min-w-full text-sm">
                              <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Titre</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Cours</th><th className="py-2 pr-4">Date de remise</th><th className="py-2 pr-4"></th></tr></thead>
                              <tbody>
                                {tptdList.map(r => (
                                  <tr key={r.id} className={`border-t border-slate-200/60 dark:border-slate-800/60 ${newlyCreatedIds.has(r.id) ? 'bg-green-200 dark:bg-green-800/40' : ''}`}>
                                    <td className="py-2 pr-4 font-medium"><Link to={`/assistant/tptd/${r.id}`} className="hover:underline">{r.title}</Link></td>
                                    <td className="py-2 pr-4">{r.type}</td>
                                    <td className="py-2 pr-4">{r.course_name}</td>
                                    <td className="py-2 pr-4">{formatDate(r.deadline)}</td>
                                    <td className="py-2 pr-4 text-right"><button className="btn !bg-red-600" onClick={()=>del(r.id)}>Supprimer</button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
