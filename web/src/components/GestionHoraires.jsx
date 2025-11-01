import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/configAxios';

export default function GestionHoraires({ currentRole }) {
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [auditoires, setAuditoires] = useState([]);
  const [selectedAuditoire, setSelectedAuditoire] = useState('');
  const [newSchedule, setNewSchedule] = useState({ day: '', time: '', course: '', teacher: '' });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);

  const isDepartmentRole = currentRole === 'chef_departement';
  const pageTitle = isDepartmentRole ? 'Gestion des Horaires du Département' : 'Gestion des Horaires de la Section';

  useEffect(() => {
    // Fetch auditoires
    const auditoiresApiEndpoint = isDepartmentRole ? '/api/department/auditoriums' : '/api/section/auditoriums';
    axios.get(auditoiresApiEndpoint).then(res => {
      setAuditoires(res.data);
      if (res.data.length > 0) {
        setSelectedAuditoire(res.data[0].id);
      }
    });
  }, [isDepartmentRole]);

  useEffect(() => {
    if (selectedAuditoire) {
      // Fetch schedules, courses, and teachers for the selected auditoire
      const schedulesApiEndpoint = isDepartmentRole
        ? `/api/department/auditoriums/${selectedAuditoire}/schedules`
        : `/api/section/auditoriums/${selectedAuditoire}/schedules`;
      const coursesApiEndpoint = isDepartmentRole
        ? `/api/department/auditoriums/${selectedAuditoire}/courses`
        : `/api/section/auditoriums/${selectedAuditoire}/courses`;
      const teachersApiEndpoint = isDepartmentRole ? '/api/department/teachers' : '/api/section/teachers';

      Promise.all([
        axios.get(schedulesApiEndpoint),
        axios.get(coursesApiEndpoint),
        axios.get(teachersApiEndpoint),
      ]).then(([schedulesRes, coursesRes, teachersRes]) => {
        setSchedules(schedulesRes.data);
        setAvailableCourses(coursesRes.data);
        setAvailableTeachers(teachersRes.data);
      });
    }
  }, [selectedAuditoire, isDepartmentRole]);

  const handleCreateSchedule = (day, time) => {
    setNewSchedule({ day, time, course: '', teacher: '' });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Logic to save the new schedule
    console.log(newSchedule);
    setShowModal(false);
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00 - ${9 + i}:00`);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Créez, modifiez et validez les horaires de cours.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label htmlFor="auditoire-select" className="font-semibold">Auditoire:</label>
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
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          + Créer un nouvel horaire
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">Heure</th>
              {days.map(day => <th key={day} scope="col" className="py-3 px-6">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{slot}</td>
                {days.map(day => {
                  const schedule = schedules.find(s => s.day === day && s.time === slot);
                  return (
                    <td key={day} className="py-4 px-6" onClick={() => !schedule && handleCreateSchedule(day, slot)}>
                      {schedule ? (
                        <div>
                          <p className="font-bold">{schedule.course.name}</p>
                          <p>{schedule.teacher.name}</p>
                        </div>
                      ) : (
                        <button className="text-blue-500 hover:text-blue-700">+</button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-1/2 max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Créer un nouvel horaire</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="course-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Cours:</label>
                <select id="course-select" name="course" value={newSchedule.course} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700">
                  <option value="">Sélectionner un cours</option>
                  {availableCourses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="teacher-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Enseignant:</label>
                <select id="teacher-select" name="teacher" value={newSchedule.teacher} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700">
                  <option value="">Sélectionner un enseignant</option>
                  {availableTeachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Créer
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
