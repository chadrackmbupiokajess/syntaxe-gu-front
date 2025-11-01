import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/configAxios'; // Corrected import
import { toast } from 'react-toastify'; // Import toast for notifications

export default function GestionHoraires({ currentRole }) {
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [auditoires, setAuditoires] = useState([]);
  const [selectedAuditoire, setSelectedAuditoire] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('session'); // Changed to 'session' for consistency with backend
  const [newSchedule, setNewSchedule] = useState({ day: '', startTime: '', endTime: '', course: '', teacher: '' });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loading, setLoading] = useState(false); // Added loading state for modal submission

  const isDepartmentRole = currentRole === 'chef_departement';
  const pageTitle = isDepartmentRole ? 'Gestion des Horaires du Département' : 'Gestion des Horaires de la Section';

  const loadSchedules = async () => {
    if (selectedAuditoire) {
      try {
        const schedulesApiEndpoint = isDepartmentRole
          ? `/api/department/auditoriums/${selectedAuditoire}/schedules?session_type=${selectedSessionType}`
          : `/api/section/auditoriums/${selectedAuditoire}/schedules?session_type=${selectedSessionType}`;
        const res = await axios.get(schedulesApiEndpoint);
        setSchedules(res.data);
      } catch (error) {
        console.error("Error loading schedules:", error);
        toast.error("Erreur lors du chargement des horaires.");
      }
    }
  };

  useEffect(() => {
    // Fetch auditoires
    const fetchAuditoires = async () => {
      try {
        const auditoiresApiEndpoint = isDepartmentRole ? '/api/department/auditoriums' : '/api/section/auditoriums';
        const res = await axios.get(auditoiresApiEndpoint);
        setAuditoires(res.data);
        if (res.data.length > 0) {
          setSelectedAuditoire(res.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching auditoires:", error);
        toast.error("Erreur lors du chargement des auditoires.");
      }
    };
    fetchAuditoires();
  }, [isDepartmentRole]);

  useEffect(() => {
    if (selectedAuditoire) {
      const fetchRelatedData = async () => {
        try {
          // Fetch courses for the selected auditoire and session type
          const coursesApiEndpoint = isDepartmentRole
            ? `/api/department/auditoriums/${selectedAuditoire}/courses?session_type=${selectedSessionType}`
            : `/api/section/auditoriums/${selectedAuditoire}/courses?session_type=${selectedSessionType}`; // Assuming section also has this endpoint
          const coursesRes = await axios.get(coursesApiEndpoint);
          setAvailableCourses(coursesRes.data);

          // Fetch teachers for the department/section
          const teachersApiEndpoint = isDepartmentRole ? '/api/department/teachers' : '/api/section/teachers';
          const teachersRes = await axios.get(teachersApiEndpoint);
          setAvailableTeachers(teachersRes.data);

          loadSchedules(); // Reload schedules with new filters
        } catch (error) {
          console.error("Error fetching related data:", error);
          toast.error("Erreur lors du chargement des cours ou enseignants.");
        }
      };
      fetchRelatedData();
    }
  }, [selectedAuditoire, selectedSessionType, isDepartmentRole]); // Added selectedSessionType to dependencies

  const handleCreateScheduleClick = (day = '', time = '') => {
    // Reset newSchedule state for a fresh form, optionally pre-filling day and time if clicked from a slot
    setNewSchedule({ day: day, startTime: time, endTime: '', course: '', teacher: '' });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));

    if (name === 'course') {
      const course = availableCourses.find(c => c.id === parseInt(value));
      if (course && course.teacher_id) {
        setNewSchedule(prev => ({ ...prev, teacher: course.teacher_id }));
      } else {
        setNewSchedule(prev => ({ ...prev, teacher: '' })); // Clear teacher if no course or no teacher assigned
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        day: newSchedule.day,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        course: newSchedule.course || null,
        teacher: newSchedule.teacher || null,
        session_type: selectedSessionType, // Use the selectedSessionType from state
      };

      const schedulesApiEndpoint = isDepartmentRole
        ? `/api/department/auditoriums/${selectedAuditoire}/schedules`
        : `/api/section/auditoriums/${selectedAuditoire}/schedules`; // Assuming section also has this endpoint

      await axios.post(schedulesApiEndpoint, payload);
      toast.success("Horaire créé avec succès !");
      setShowModal(false);
      loadSchedules(); // Reload schedules after creation
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Erreur lors de la création de l'horaire.");
    } finally {
      setLoading(false);
    }
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = useMemo(() => {
    // Generate time slots from 8:00 to 18:00
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      slots.push(`${i < 10 ? '0' : ''}${i}:00`);
    }
    return slots;
  }, []); // No dependencies, so it runs once

  const getCourseAndTeacherForSlot = (day, timeSlot) => {
    const schedule = schedules.find(s => s.day === day && s.startTime === timeSlot);
    if (schedule) {
      return {
        courseName: schedule.course?.name || 'N/A',
        teacherName: schedule.teacher?.name || 'N/A',
      };
    }
    return null;
  };

  const selectedAuditoireName = useMemo(() => {
    const auditoire = auditoires.find(a => a.id === parseInt(selectedAuditoire));
    return auditoire ? auditoire.name : '';
  }, [auditoires, selectedAuditoire]);

  if (!currentRole) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Chargement du rôle...</div>;
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Créez, modifiez et validez les horaires de cours.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label htmlFor="auditoire-select" className="font-semibold text-gray-700 dark:text-gray-300">Auditoire:</label>
          <select
            id="auditoire-select"
            value={selectedAuditoire}
            onChange={(e) => setSelectedAuditoire(e.target.value)}
            className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white"
          >
            {auditoires.map(auditoire => (
              <option key={auditoire.id} value={auditoire.id}>{auditoire.name}</option>
            ))}
          </select>
          <label htmlFor="session-type-select" className="font-semibold text-gray-700 dark:text-gray-300">Session:</label>
          <select
            id="session-type-select"
            value={selectedSessionType}
            onChange={(e) => setSelectedSessionType(e.target.value)}
            className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white"
          >
            <option value="mi-session">Mi-session</option> {/* Changed value */}
            <option value="session">Session</option> {/* Changed value */}
          </select>
        </div>
        <button onClick={handleCreateScheduleClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          + Créer un nouvel horaire
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm overflow-x-auto">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Horaires pour : {selectedAuditoireName} - {selectedSessionType}</h3>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">Heure</th>
              {days.map(day => <th key={day} scope="col" className="py-3 px-6">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {timeSlots.length > 0 ? (
              timeSlots.map(slot => (
                <tr key={slot} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{`${slot} - ${parseInt(slot.split(':')[0]) + 1}:00`}</td>
                  {days.map(day => {
                    const scheduleInfo = getCourseAndTeacherForSlot(day, slot);
                    return (
                      <td key={day} className="py-4 px-6">
                        {scheduleInfo ? (
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{scheduleInfo.courseName}</p>
                            <p className="text-gray-600 dark:text-gray-400">{scheduleInfo.teacherName}</p>
                          </div>
                        ) : (
                          <button onClick={() => handleCreateScheduleClick(day, slot)} className="text-blue-500 hover:text-blue-700">
                            +
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={days.length + 1} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucun horaire créé pour cet auditoire et cette session.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-1/2 max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Créer un nouvel horaire</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="day-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Jour:</label>
                <select id="day-select" name="day" value={newSchedule.day} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700" required>
                  <option value="">Sélectionner un jour</option>
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startTime-input" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Heure de début:</label>
                  <input id="startTime-input" type="time" name="startTime" value={newSchedule.startTime} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700" required />
                </div>
                <div>
                  <label htmlFor="endTime-input" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Heure de fin:</label>
                  <input id="endTime-input" type="time" name="endTime" value={newSchedule.endTime} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700" required />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="course-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Cours (Optionnel):</label>
                <select id="course-select" name="course" value={newSchedule.course} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700">
                  <option value="">Sélectionner un cours</option>
                  {availableCourses.map(course => <option key={course.id} value={course.id}>{course.intitule} ({course.teacher})</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="teacher-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Enseignant:</label>
                <select id="teacher-select" name="teacher" value={newSchedule.teacher} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700">
                  <option value="">Aucun enseignant sélectionné</option>
                  {availableTeachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={loading}>
                  {loading ? 'Création...' : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
