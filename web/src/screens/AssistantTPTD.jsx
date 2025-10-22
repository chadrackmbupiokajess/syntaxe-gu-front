import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '../shared/ToastProvider'

export default function AssistantTPTD() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ title: '', type: 'TP', course_code: '', auditorium: '', deadlineLocal: '', description: '' })
  const [auditoriums, setAuditoriums] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => { const { data } = await axios.get('/api/tptd/my/'); setRows(data) }
  useEffect(() => { load() }, [])

  // charger auditoires au montage
  useEffect(() => {
    const fetchAud = async () => {
      const { data } = await axios.get('/api/auditoriums/assistant/my/')
      setAuditoriums(data)
      if (data[0] && !form.auditorium) setForm(f => ({ ...f, auditorium: data[0].code }))
    }
    fetchAud()
  }, [])

  // charger cours quand auditoire change
  useEffect(() => {
    const fetchCourses = async () => {
      if (!form.auditorium) { setCourses([]); return }
      const { data } = await axios.get(`/api/assistant/auditoriums/${encodeURIComponent(form.auditorium)}/courses`)
      setCourses(data)
      if (data[0] && !form.course_code) setForm(f => ({ ...f, course_code: data[0].code }))
    }
    fetchCourses()
  }, [form.auditorium])

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
          <label className="text-sm">Date de fin (remise)
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

      <div className="card p-4 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Mes TP/TD</h3>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-2 pr-4">Titre</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Cours</th><th className="py-2 pr-4">Auditoire</th><th className="py-2 pr-4">Deadline</th><th className="py-2 pr-4"></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                <td className="py-2 pr-4 font-medium">{r.title}</td>
                <td className="py-2 pr-4">{r.type}</td>
                <td className="py-2 pr-4">{r.course_code}</td>
                <td className="py-2 pr-4">{r.auditorium}</td>
                <td className="py-2 pr-4">{r.deadline?.replace('T',' ').replace('Z','')}</td>
                <td className="py-2 pr-4 text-right"><button className="btn !bg-red-600" onClick={()=>del(r.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
