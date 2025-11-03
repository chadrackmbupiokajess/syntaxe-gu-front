import React, { useEffect, useState } from 'react';
import axios from '../api/configAxios';
import KpiCard from '../components/KpiCard';
import ListWithFilters from '../components/ListWithFilters';
import Skeleton from '../components/Skeleton';
import { useToast } from '../shared/ToastProvider';
import { FaUsers, FaBook, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

export default function SgaDashboard() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // Modal state
  const [data, setData] = useState({
    kpi: null,
    programApprovals: [],
    calendarEvents: [],
    enrollmentRequests: [],
    deliberationSessions: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, programApprovalsRes, calendarEventsRes, enrollmentRequestsRes, deliberationSessionsRes] = await Promise.all([
        axios.get('/api/sga/kpi'),
        axios.get('/api/sga/academic-coordination/program-approvals'),
        axios.get('/api/sga/academic-coordination/calendar-events'),
        axios.get('/api/sga/student-management/enrollment-requests'),
        axios.get('/api/sga/evaluation-supervision/deliberation-sessions'),
      ]);

      setData({
        kpi: kpiRes.data,
        programApprovals: programApprovalsRes.data,
        calendarEvents: calendarEventsRes.data,
        enrollmentRequests: enrollmentRequestsRes.data,
        deliberationSessions: deliberationSessionsRes.data,
      });
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des données du tableau de bord SGA. Vérifiez votre API Django.', status: 'error' });
      console.error("Error loading SGA dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
    push({ title: 'Données rafraîchies', status: 'success' });
  };

  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);

  return (
    <div className="grid gap-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !data.kpi ? (
          <><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></>
        ) : (
          <>
            <KpiCard label="Total Étudiants" value={data.kpi.totalStudents} icon={<FaUsers />} color="bg-blue-500" />
            <KpiCard label="Programmes à valider" value={data.kpi.programsToReview} icon={<FaBook />} color="bg-orange-500" />
            <KpiCard label="Total Enseignants" value={data.kpi.teachers} icon={<FaUsers />} color="bg-green-500" />
            <KpiCard label="Inscriptions en attente" value={data.kpi.pendingEnrollments} icon={<FaCheckCircle />} color="bg-yellow-500" />
          </>
        )}
      </div>

      {/* Academic Coordination Section */}
      <ListWithFilters
        title="Approbation des Programmes de Cours"
        data={data.programApprovals}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'program', header: 'Programme' },
          { key: 'department', header: 'Département' },
          { key: 'status', header: 'Statut' },
        ]}
        actions={[
          { label: 'Approuver', onClick: (row) => push({ title: 'Action', message: `Programme ${row.program} approuvé.` }) },
          { label: 'Rejeter', onClick: (row) => push({ title: 'Action', message: `Programme ${row.program} rejeté.` }) },
        ]}
      />

      {/* Student Enrollment Management */}
      <ListWithFilters
        title="Gestion des Inscriptions Étudiantes"
        data={data.enrollmentRequests}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'student', header: 'Étudiant' },
          { key: 'program', header: 'Programme' },
          { key: 'status', header: 'Statut' },
        ]}
        actions={[
          { label: 'Valider l\'inscription', onClick: (row) => push({ title: 'Action', message: `Inscription de ${row.student} validée.` }) },
        ]}
      />

      {/* Evaluation and Deliberation Supervision */}
      <ListWithFilters
        title="Supervision des Délibérations"
        data={data.deliberationSessions}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'faculty', header: 'Faculté/Section' },
          { key: 'date', header: 'Date Prévue' },
          { key: 'status', header: 'Statut' },
        ]}
        actions={[
          { label: 'Voir les résultats', onClick: (row) => push({ title: 'Info', message: `Affichage des résultats pour ${row.faculty}.` }) },
        ]}
      />

      {/* Academic Calendar Overview */}
      <ListWithFilters
        title="Calendrier Académique - Événements Clés"
        data={data.calendarEvents}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'event', header: 'Événement' },
          { key: 'date', header: 'Date' },
        ]}
        actions={[
          { label: 'Planifier', onClick: (row) => push({ title: 'Action', message: `Planification de ${row.event}.` }) },
        ]}
      />

      {/* Auditoire et Horaire Section */}
      <ListWithFilters
        title="Auditoires et Horaires"
        data={[{ id: 1, name: 'Principal', description: 'Voir les horaires des cours' }]} // Dummy data
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'name', header: 'Auditoire' },
          { key: 'description', header: 'Description' },
        ]}
        actions={[
          { label: "Voir l'horaire", onClick: openScheduleModal },
        ]}
      />

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Horaire des cours</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 p-2">Jour</th>
                  <th className="border-b-2 p-2">Heures</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border-b p-2">Lundi</td><td className="border-b p-2">8:00 - 17:00</td></tr>
                <tr><td className="border-b p-2">Mardi</td><td className="border-b p-2">8:00 - 17:00</td></tr>
                <tr><td className="border-b p-2">Mercredi</td><td className="border-b p-2">8:00 - 17:00</td></tr>
                <tr><td className="border-b p-2">Jeudi</td><td className="border-b p-2">8:00 - 17:00</td></tr>
                <tr><td className="border-b p-2">Vendredi</td><td className="border-b p-2">8:00 - 17:00</td></tr>
                <tr><td className="border-b p-2">Samedi</td><td className="border-b p-2">9:00 - 12:00</td></tr>
              </tbody>
            </table>
            <div className="text-right mt-4">
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
