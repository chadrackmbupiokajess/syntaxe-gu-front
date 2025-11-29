import React, { useState, useEffect, useMemo } from 'react';
import { safeGet } from '../api/safeGet';
import { toast } from 'react-toastify';

export default function GestionHoraireStudent() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('session'); // 'session' or 'mi-session'
  const [auditoriumName, setAuditoriumName] = useState('');

  const days = useMemo(() => ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'], []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // The backend should know the student's auditorium. We just pass the session type.
        const scheduleData = await safeGet(`/api/student/schedule?session_type=${activeTab}`);
        setSchedules(scheduleData || []);
        
        // Set auditorium name from the first schedule item
        if (scheduleData && scheduleData.length > 0) {
          setAuditoriumName(scheduleData[0].auditorium_name || 'Mon Auditoire');
        } else {
          // If no schedule, we don't know the auditorium name from this endpoint
          setAuditoriumName('Mon Auditoire');
        }
      } catch (error) {
        console.error("Error loading student schedule:", error);
        toast.error("Erreur lors du chargement de l'horaire.");
        setSchedules([]); // Clear schedules on error
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [activeTab]); // Refetch when the tab changes

  const groupedSchedulesByTime = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];
    
    const groups = schedules.reduce((acc, schedule) => {
      const timeKey = `${schedule.startTime} - ${schedule.endTime}`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(schedule);
      return acc;
    }, {});
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [schedules]);

  const tabButtonClasses = (tabName) => 
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeTab === tabName 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;

  return (
    <div className="space-y-6 mt-4">
      {/* Session Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
          {auditoriumName}
        </h3>
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button onClick={() => setActiveTab('session')} className={tabButtonClasses('session')}>
            Session
          </button>
          <button onClick={() => setActiveTab('mi-session')} className={tabButtonClasses('mi-session')}>
            Mi-session
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Chargement de l'horaire...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="py-3 px-6">Heure</th>
                {days.map(day => <th key={day} scope="col" className="py-3 px-6">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {groupedSchedulesByTime.length > 0 ? (
                groupedSchedulesByTime.map(([timeRange, schedulesInRow]) => (
                  <tr key={timeRange} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                    <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-slate-200">
                      {timeRange}
                    </td>
                    {days.map(day => {
                      const scheduleInfo = schedulesInRow.find(s => s.day === day);
                      return (
                        <td key={day} className="py-4 px-6">
                          {scheduleInfo ? (
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{scheduleInfo.course_title}</p>
                              <p className="text-slate-600 dark:text-slate-400">{scheduleInfo.teacher_name}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={days.length + 1} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Aucun horaire publié pour cette session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
