import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

const StatusIndicator = ({ status }) => {
  const styles = {
    saving: 'text-orange-500',
    saved: 'text-green-500',
    error: 'text-red-500',
    default: 'text-gray-400'
  };
  const text = {
    saving: 'Enregistrement...',
    saved: 'Enregistré',
    error: 'Erreur',
    default: 'En attente'
  }
  return <div className={`text-xs ${styles[status] || styles.default}`}>{text[status] || text.default}</div>;
};

const StudentGradeCard = ({ student, setGrade }) => {
  const [grade, setLocalGrade] = useState(student.grade ?? '');
  const [status, setStatus] = useState('default');

  const debouncedSave = useCallback(
    debounce(async (newGrade) => {
      setStatus('saving');
      try {
        await setGrade(student.student_id, newGrade);
        setStatus('saved');
      } catch (error) {
        setStatus('error');
      }
    }, 1000), 
    [student.student_id, setGrade]
  );

  const handleChange = (e) => {
    const newGrade = e.target.value;
    setLocalGrade(newGrade);
    debouncedSave(newGrade);
  };

  return (
    <div className="card p-4 flex items-center gap-4">
      <img src={student.avatar} alt={`Avatar de ${student.student_name}`} className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-grow">
        <div className="font-semibold">{student.student_name}</div>
        <div className="text-sm text-slate-500 dark:text-white/70">{student.matricule}</div>
      </div>
      <div className="flex flex-col items-end">
        <input 
          type="number" 
          min="0" 
          max="20" 
          step="0.5" 
          value={grade} 
          onChange={handleChange}
          onBlur={() => debouncedSave.flush()} // Save immediately on blur
          className="w-24 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-semibold"
        />
        <StatusIndicator status={status} />
      </div>
    </div>
  );
};

export default function AssistantGrades() {
  const [auditoriums, setAuditoriums] = useState([]);
  const [audId, setAudId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseCode, setCourseCode] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState({ aud: true, courses: false, grades: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(prev => ({ ...prev, aud: true }));
    axios.get('/api/auditoriums/assistant/my/').then(r => {
      setAuditoriums(r.data);
      if (r.data[0]) {
        setAudId(r.data[0].id);
      }
      setLoading(prev => ({ ...prev, aud: false }));
    }).catch(err => {
      setError("Impossible de charger les auditoires.");
      setLoading(prev => ({ ...prev, aud: false }));
    });
  }, []);

  useEffect(() => {
    if (!audId) return;
    setLoading(prev => ({ ...prev, courses: true }));
    const selectedAud = auditoriums.find(a => a.id === audId);
    if (!selectedAud) return;

    axios.get(`/api/assistant/auditoriums/${selectedAud.id}/courses`).then(r => {
      setCourses(r.data);
      if (r.data[0]) {
        setCourseCode(r.data[0].code);
      } else {
        setCourseCode('');
        setRows([]);
      }
      setLoading(prev => ({ ...prev, courses: false }));
    }).catch(err => {
      setError("Impossible de charger les cours.");
      setLoading(prev => ({ ...prev, courses: false }));
    });
  }, [audId, auditoriums]);

  useEffect(() => {
    const selectedAud = auditoriums.find(a => a.id === audId);
    if (!selectedAud || !courseCode) {
      setRows([]);
      return;
    }

    setLoading(prev => ({ ...prev, grades: true }));
    axios.get(`/api/assistant/grades/${encodeURIComponent(selectedAud.code)}/${encodeURIComponent(courseCode)}`).then(r => {
      setRows(r.data);
      setLoading(prev => ({ ...prev, grades: false }));
    }).catch(err => {
      setError("Impossible de charger les notes.");
      setLoading(prev => ({ ...prev, grades: false }));
    });
  }, [audId, courseCode, auditoriums]);

  const setGrade = async (student_id, grade) => {
    const selectedAud = auditoriums.find(a => a.id === audId);
    if (!selectedAud || !courseCode) return;

    return axios.patch(`/api/assistant/grades/${encodeURIComponent(selectedAud.code)}/${encodeURIComponent(courseCode)}`, { student_id, grade: Number(grade) });
  };

  return (
    <div className="grid gap-4">
      <div className="card p-4">
        <h1 className="text-xl font-semibold mb-3">Gestion des Notes par Auditoire</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select className="select" value={audId || ''} onChange={e => setAudId(Number(e.target.value))} disabled={loading.aud}>
            <option value="" disabled>Sélectionner un auditoire</option>
            {auditoriums.map(a => <option key={a.id} value={a.id}>{a.code}</option>)}
          </select>
          <select className="select" value={courseCode} onChange={e => setCourseCode(e.target.value)} disabled={loading.courses || !courses.length}>
            <option value="" disabled>Sélectionner un cours</option>
            {courses.map(c => <option key={c.id} value={c.code}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {(loading.grades || loading.courses) && <div className="text-center p-8">Chargement...</div>}
      {error && <div className="card p-4 bg-red-100 text-red-700">{error}</div>}
      
      {!loading.grades && !error && audId && courseCode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.length > 0 ? (
            rows.map(r => (
              <StudentGradeCard key={r.student_id} student={r} setGrade={setGrade} />
            ))
          ) : (
            <div className="col-span-full text-center p-8 text-slate-500">Aucun étudiant trouvé pour cette sélection.</div>
          )}
        </div>
      )}
    </div>
  );
}
