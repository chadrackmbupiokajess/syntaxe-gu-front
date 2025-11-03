import React, { useEffect, useState } from 'react';
import axios from '../api/configAxios';
import ListWithFilters from '../components/ListWithFilters';
import Skeleton from '../components/Skeleton';
import { useToast } from '../shared/ToastProvider';

export default function SgaAuditoires() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [auditoires, setAuditoires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAuditorium, setSelectedAuditorium] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [sessionType, setSessionType] = useState('session');

  const fetchDepartements = async () => {
    try {
      const response = await axios.get('/api/sga/departements');
      setDepartements(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des départements.', status: 'error' });
      console.error("Error loading departments:", error);
    }
  };

  const fetchAuditoires = async (departementId = '') => {
    setLoading(true);
    try {
      const url = departementId ? `/api/sga/auditoires?departement_id=${departementId}` : '/api/sga/auditoires';
      const response = await axios.get(url);
      setAuditoires(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des auditoires.', status: 'error' });
      console.error("Error loading auditoires:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (auditoriumId, sessionType) => {
    try {
      const response = await axios.get(`/api/sga/auditoires/${auditoriumId}/schedule?session_type=${sessionType}`);
      setSchedule(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: "Erreur lors du chargement de l'horaire.", status: 'error' });
      console.error("Error loading schedule:", error);
    }
  };

  useEffect(() => {
    fetchDepartements();
    fetchAuditoires();
  }, []);

  useEffect(() => {
    if (selectedAuditorium) {
      fetchSchedule(selectedAuditorium.id, sessionType);
    }
  }, [sessionType, selectedAuditorium]);

  const handleDepartementChange = (e) => {
    const deptId = e.target.value;
    setSelectedDepartement(deptId);
    const dept = departements.find(d => String(d.id) === deptId);
    setSelectedSectionName(dept ? dept.section : '');
    fetchAuditoires(deptId);
  };

  const handleClearFilter = () => {
    setSelectedDepartement('');
    setSelectedSectionName('');
    fetchAuditoires(); // Fetch all auditoires
  };

  const refreshData = () => {
    fetchAuditoires(selectedDepartement);
    push({ title: 'Données rafraîchies', status: 'success' });
  };

  const openScheduleModal = (auditorium) => {
    setSelectedAuditorium(auditorium);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedAuditorium(null);
    setSchedule(null);
  };

  const formatSchedule = (scheduleData) => {
    if (!scheduleData) return {};

    const formatted = {};
    scheduleData.forEach(day => {
      day.events.forEach(event => {
        const time = `${event.startTime} - ${event.endTime}`;
        if (!formatted[time]) {
          formatted[time] = {};
        }
        formatted[time][day.day] = {
          course: event.courseName,
          teacher: event.teacherName,
        };
      });
    });

    return formatted;
  };

  const scheduleData = formatSchedule(schedule);

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Auditoires & Horaires</h2>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label htmlFor="departement-select" className="text-black dark:text-white font-medium">Filtrer par Département :</label>
          <select
            id="departement-select"
            className="p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDepartement}
            onChange={handleDepartementChange}
          >
            <option value="">Tous les Départements</option>
            {departements.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {selectedSectionName && (
            <span className="text-gray-600 dark:text-gray-400 text-sm italic">Section : {selectedSectionName}</span>
          )}
          {selectedDepartement && (
            <button
              onClick={handleClearFilter}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      </div>

      <ListWithFilters
        title="Liste des Auditoires"
        data={auditoires}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'name', header: 'Auditoire' },
          { key: 'level', header: 'Niveau' },
          { key: 'student_count', header: 'Nombre d\'étudiants' },
          { key: 'course_count', header: 'Nombre de cours' },
        ]}
        actions={[
          { label: 'Voir Horaires', onClick: openScheduleModal },
        ]}
      />

      {isScheduleModalOpen && selectedAuditorium && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-6xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black dark:text-white">Horaires pour : {selectedAuditorium.name}</h2>
              <select
                className="p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
              >
                <option value="session">Session</option>
                <option value="mi-session">Mi-Session</option>
              </select>
            </div>
            {schedule ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700">
                    <th className="border-b-2 p-2 w-32 dark:border-slate-600 text-black dark:text-white">Heure</th>
                    <th className="border-b-2 p-2 dark:border-slate-600 text-black dark:text-white">Lundi</th>
                    <th className="border-b-2 p-2 dark:border-slate-600 text-black dark:text-white">Mardi</th>
                    <th className="border-b-2 p-2 dark:border-slate-600 text-black dark:text-white">Mercredi</th>
                    <th className="border-b-2 p-2 dark:border-slate-600 text-black dark:text-white">Jeudi</th>
                    <th className="border-b-2 p-2 dark:border-slate-600 text-black dark:text-white">Vendredi</th>
                    <th className="border-b-2 p-2 dark:border-slate-600 text-black dark:text-white">Samedi</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scheduleData).map(([time, days]) => (
                    <tr key={time}>
                      <td className="border-b p-2 font-medium dark:border-slate-600 text-black dark:text-white">{time}</td>
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                        <td key={day} className="border-b p-2 align-top dark:border-slate-600">
                          {days[day] ? (
                            <div className='text-center text-black dark:text-white'>
                              <p className="font-semibold">{days[day].course}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{days[day].teacher}</p>
                            </div>
                          ) : (
                            <div className='text-center text-gray-500 dark:text-gray-400'>-</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Skeleton className="h-64" />
            )}
            <div className="text-right mt-6">
              <button onClick={closeScheduleModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
