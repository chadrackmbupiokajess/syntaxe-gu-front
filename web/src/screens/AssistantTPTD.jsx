import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useToast } from '../shared/ToastProvider'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
  let formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
  formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1).replace('.', '');
  return formattedDate.replace(/\//g, '-');
};

export default function AssistantTPTD() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ title: '', type: 'TP', course_code: '', auditorium: '', deadlineLocal: '', description: '' })
  const [auditoriums, setAuditoriums] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [openSections, setOpenSections] = useState({});

  const load = async () => { const { data } = await axios.get('/api/tptd/my/'); setRows(data) }
  useEffect(() => { load() }, [])

  useEffect(() => {
    const fetchAud = async () => {
      const { data } = await axios.get('/api/auditoriums/assistant/my/')
      setAuditoriums(data)
      if (data[0] && !form.auditorium) setForm(f => ({ ...f, auditorium: data[0].code }))
    }
    fetchAud()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      if (!form.auditorium) { setCourses([]); return }
      const { data } = await axios.get(`/api/assistant/auditoriums/${encodeURIComponent(form.auditorium)}/courses`)
      setCourses(data)
      if (data[0] && !form.course_code) setForm(f => ({ ...f, course_code: data[0].code }))
    }
    fetchCourses()
  }, [form.auditorium])

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

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const createItem = async () => {
    if (!form.title || !form.course_code || !form.auditorium) {
      toast.push({ kind: 'error', title: 'Champs requis', message: 'Titre, Auditoire et Code du cours sont requis.' })
      return
    }
    const payload = {
      title: form.title,
      type: form.type,
      course_code: form.course_code,
      auditorium: form.auditorium,
      description: form.description,
      deadline: form.deadlineLocal ? new Date(form.deadlineLocal).toISOString() : ''
    }
    setLoading(true)
    await axios.post('/api/tptd/my/', payload)
    setForm({ title: '', type: 'TP', course_code: '', auditorium: '', deadlineLocal: '', description: '' })
    await load()
    setLoading(false)
    toast.push({ title: 'TP/TD créé' })
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
            <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" value={form.auditorium} onChange={e=>setForm({...form,auditorium:e.target.value, course_code: ''})}>
              {auditoriums.map(a => (
                <option key={a.code} value={a.code}>{a.code} • {a.name}</option>
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
          <label className="text-sm md:col-span-2">Description
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800" placeholder="Consignes, ressources, etc." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </label>
        </div>
        <div>
          <button className="btn" onClick={createItem} disabled={loading}>{loading ? 'Création...' : 'Créer'}</button>
        </div>
      </div>

      <div className="card p-4 grid gap-2">
        <h3 className="text-lg font-semibold mb-2">Mes TP/TD</h3>
        {Object.entries(groupedData).map(([department, auditoriums]) => (
          <div key={department} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 py-2">
            <button onClick={() => toggleSection(department)} className="w-full text-left font-semibold text-lg flex justify-between items-center">
              <span>{department}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[department] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {openSections[department] && (
              <div className="pl-4 mt-2 grid gap-2">
                {Object.entries(auditoriums).map(([auditorium, tptdList]) => (
                  <div key={auditorium}>
                    <button onClick={() => toggleSection(auditorium)} className="w-full text-left font-medium text-md flex justify-between items-center">
                      <span>{auditorium}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${openSections[auditorium] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {openSections[auditorium] && (
                      <div className="overflow-auto mt-2">
                        <table className="min-w-full text-sm">
                          <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Titre</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Cours</th><th className="py-2 pr-4">Date de remise</th><th className="py-2 pr-4"></th></tr></thead>
                          <tbody>
                            {tptdList.map(r => (
                              <tr key={r.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-medium">{r.title}</td>
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
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
