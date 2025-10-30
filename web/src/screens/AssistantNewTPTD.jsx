import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function AssistantNewTPTD() {
  const { code } = useParams();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [totalPoints, setTotalPoints] = useState(10);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    axios.get(`/api/assistant/auditoriums/${encodeURIComponent(code)}/courses`).then(r => setCourses(r.data || []));
  }, [code]);

  const submit = async () => {
    if (!courseId || !title || !deadline) return;
    setSaving(true);
    try {
      const payload = {
        course_id: Number(courseId),
        title,
        deadline,
        total_points: totalPoints,
      };
      const { data } = await axios.post(`/api/assistant/auditoriums/${encodeURIComponent(code)}/tptd/new`, payload);
      setCreated(data);
      setTitle('');
      setDeadline('');
      setTotalPoints(10);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-2xl font-bold">Nouveau TP/TD • {code}</h1>
      <div className="card p-4 bg-slate-800">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">Cours
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="mt-1 w-full rounded bg-slate-900 border border-white/10 p-2">
              <option value="">— Choisir —</option>
              {courses.map(c => (<option key={c.code} value={(c.id || '')}>{c.title} ({c.code})</option>))}
            </select>
          </label>
          <label className="text-sm">Titre
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded bg-slate-900 border border-white/10 p-2" />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <label className="text-sm block">Deadline (ISO 8601)
            <input value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="2025-11-05T10:00:00Z" className="mt-1 w-full rounded bg-slate-900 border border-white/10 p-2" />
          </label>
          <label className="text-sm block">Points Totaux
            <input type="number" value={totalPoints} onChange={e => setTotalPoints(Number(e.target.value))} className="mt-1 w-full rounded bg-slate-900 border border-white/10 p-2" />
          </label>
        </div>
        <button className="btn mt-3" disabled={saving || !courseId || !title || !deadline} onClick={submit}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        {created && (<p className="text-white/70 text-sm mt-2">Crée: {created.title} • {created.deadline?.replace('T', ' ').slice(0, 19)}</p>)}
      </div>
    </div>
  );
}
