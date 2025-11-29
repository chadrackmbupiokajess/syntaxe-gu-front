import React, { useState, useEffect, useMemo } from 'react';
import { safeGet } from '../api/safeGet';
import { toast } from 'react-toastify';

export default function GestionHoraireStudent() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditoriumName, setAuditoriumName] = useState('');
  const [sessionType, setSessionType] = useState('');

  const days = useMemo(() => ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'], []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const scheduleData = await safeGet('/api/student/schedule');
        setSchedules(scheduleData || []);
        
        if (scheduleData && scheduleData.length > 0) {
          setAuditoriumName(scheduleData[0].auditorium_name || 'N/A');
          setSessionType(scheduleData[0].session_type || 'N/A');
        }
      } catch (error) {
        console.error("Error loading student schedule:", error);
        toast.error("Erreur lors du chargement de l'horaire.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // Group schedules by their unique time range (e.g., "08:00 - 10:00")
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
    
    // Sort by start time
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [schedules]);

  if (loading) {
    return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chargement de l'horaire...</div>;
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm overflow-x-auto">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          Horaires pour : {auditoriumName} - {sessionType}
        </h3>
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
                  Aucun horaire publié pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
