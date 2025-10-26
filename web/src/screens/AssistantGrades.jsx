import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    default: ''
  }
  return <div className={`text-xs h-4 ${styles[status] || styles.default}`}>{text[status] || text.default}</div>;
};

const StudentGradeCard = ({ student, setGrade }) => {
  const [grade, setLocalGrade] = useState(student.grade);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('default');

  const handleSave = async (newGrade) => {
    if (newGrade === student.grade) return;
    setStatus('saving');
    try {
      await setGrade(student.student_id, newGrade);
      setLocalGrade(newGrade);
      setStatus('saved');
    } catch (error) {
      setStatus('error');
    }
    setIsEditing(false);
  };

  const handleBlur = (e) => {
    handleSave(Number(e.target.value));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave(Number(e.target.value));
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className="card p-4 flex items-center gap-4">
      <img src={student.avatar} alt={`Avatar de ${student.student_name}`} className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-grow">
        <div className="font-semibold">{student.student_name}</div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {isEditing ? (
          <input 
            type="number" 
            min="0" 
            max="20" 
            step="0.5" 
            defaultValue={grade ?? ''} 
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-24 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-brand-500 text-center font-semibold"
          />
        ) : (
          <div 
            className="w-24 h-8 flex items-center justify-center font-bold text-lg cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {grade !== null && grade !== undefined ? (
              <div>
                <span className={grade < 10 ? 'text-red-500' : 'text-green-500'}>{grade}</span>
                <span className="text-sm text-slate-500"> /20</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400">Non noté</span>
            )}
          </div>
        )}
        <StatusIndicator status={status} />
      </div>
    </div>
  );
};

const CustomSelect = ({ options, value, onChange, placeholder, icon, disabled, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  const setOpen = (open) => {
    if (isOpen !== open) {
      setIsOpen(open);
      if (onToggle) onToggle(open);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  return (
    <div className="relative w-64" ref={ref}>
      <button onClick={() => setOpen(!isOpen)} disabled={disabled} className="btn w-full flex items-center justify-between !bg-slate-100 dark:!bg-slate-800">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-slate-500 dark:text-white/70">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <svg className={`w-5 h-5 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 card p-2 shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div key={option.value} onClick={() => { onChange(option.value); setOpen(false); }} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AssistantGrades() {
  const [auditoriums, setAuditoriums] = useState([]);
  const [selectedAudId, setSelectedAudId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState({ aud: true, courses: false, grades: false });
  const [error, setError] = useState(null);
  const [isAudSelectOpen, setIsAudSelectOpen] = useState(false);
  const [isCourseSelectOpen, setIsCourseSelectOpen] = useState(false);

  const isSelectOpen = isAudSelectOpen || isCourseSelectOpen;

  useEffect(() => {
    setLoading(prev => ({ ...prev, aud: true }));
    axios.get('/api/auditoriums/assistant/my/').then(r => {
      setAuditoriums(r.data);
      if (r.data[0]) {
        setSelectedAudId(r.data[0].id);
      }
      setLoading(prev => ({ ...prev, aud: false }));
    }).catch(err => {
      setError("Impossible de charger les auditoires.");
      setLoading(prev => ({ ...prev, aud: false }));
    });
  }, []);

  const handleAuditoriumChange = (newAudId) => {
    setSelectedAudId(newAudId);
    setCourses([]);
    setSelectedCourseCode('');
    setRows([]);
    setError(null);
  };

  useEffect(() => {
    if (!selectedAudId) return;

    setLoading(prev => ({ ...prev, courses: true }));
    axios.get(`/api/assistant/auditoriums/${selectedAudId}/courses`).then(r => {
      setCourses(r.data);
      if (r.data[0]) {
        setSelectedCourseCode(r.data[0].code);
      } else {
        setSelectedCourseCode('');
      }
      setLoading(prev => ({ ...prev, courses: false }));
    }).catch(err => {
      setError("Impossible de charger les cours.");
      setLoading(prev => ({ ...prev, courses: false }));
    });
  }, [selectedAudId]);

  useEffect(() => {
    if (!selectedAudId || !selectedCourseCode) {
      setRows([]);
      return;
    }

    setLoading(prev => ({ ...prev, grades: true }));
    setError(null);
    axios.get(`/api/assistant/grades/${selectedAudId}/${encodeURIComponent(selectedCourseCode)}`).then(r => {
      setRows(r.data);
      setLoading(prev => ({ ...prev, grades: false }));
    }).catch(err => {
      setError("Impossible de charger les notes.");
      setRows([]);
      setLoading(prev => ({ ...prev, grades: false }));
    });
  }, [selectedAudId, selectedCourseCode]);

  const setGrade = async (student_id, grade) => {
    if (!selectedAudId || !selectedCourseCode) return;

    await axios.patch(`/api/assistant/grades/${selectedAudId}/${encodeURIComponent(selectedCourseCode)}`, { student_id, grade: Number(grade) });
    
    setRows(prevRows => prevRows.map(row => 
      row.student_id === student_id ? { ...row, grade: Number(grade) } : row
    ));
  };

  const audOptions = auditoriums.map(a => ({ value: a.id, label: `${a.code} - ${a.department}` }));
  const courseOptions = courses.map(c => ({ value: c.code, label: c.title }));

  return (
    <div className="grid gap-4">
      <div className="card p-4 relative z-10">
        <h1 className="text-xl font-semibold mb-3">Gestion des Notes par Auditoire</h1>
        <div className="flex flex-wrap items-center gap-3">
          <CustomSelect 
            options={audOptions}
            value={selectedAudId}
            onChange={handleAuditoriumChange}
            placeholder="Sélectionner un auditoire"
            disabled={loading.aud}
            onToggle={setIsAudSelectOpen}
            icon={<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4m0 4h5m0-4v4m0-4H5m14 0v-4m0 4h-2m-5-4v4m-5-4h5" /></svg>}
          />
          <CustomSelect 
            options={courseOptions}
            value={selectedCourseCode}
            onChange={setSelectedCourseCode}
            placeholder="Sélectionner un cours"
            disabled={loading.courses || !courses.length}
            onToggle={setIsCourseSelectOpen}
            icon={<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494M12 6.253L15.46 9.714M12 6.253L8.54 9.714" /></svg>}
          />
        </div>
      </div>

      {(loading.grades || loading.courses) && <div className="text-center p-8">Chargement...</div>}
      {error && <div className="card p-4 bg-red-100 text-red-700">{error}</div>}
      
      {!loading.grades && !error && selectedAudId && selectedCourseCode && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ${isSelectOpen ? 'blur-sm pointer-events-none' : ''}`}>
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
