import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/configAxios';
import KpiCard from '../components/KpiCard';
import { useToast } from '../shared/ToastProvider';
import { FaUsers, FaBook, FaSync } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';

// Composant pour une ligne de données, pour éviter la répétition
const DataRow = ({ item, columns, actions }) => (
  <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
      {columns.map(col => (
        <span key={col.key} className="text-sm text-gray-700">{item[col.key]}</span>
      ))}
    </div>
    <div className="flex items-center gap-3 ml-4">
      {actions.map(action => (
        <button
          key={action.label}
          onClick={() => action.onClick(item)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

// Composant pour une section du tableau de bord
const DashboardSection = ({ title, loading, children, itemCount }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {itemCount > 0 && <span className="text-sm font-bold text-indigo-600 bg-indigo-100 py-1 px-2 rounded-full">{itemCount}</span>}
    </div>
    {loading ? (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
      </div>
    ) : (
      <div>{children}</div>
    )}
  </div>
);

export default function SgaDashboard() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpi: null,
    programApprovals: [],
    calendarEvents: [],
    enrollmentRequests: [],
    deliberationSessions: [],
  });

  const fetchData = useCallback(async () => {
    if (!loading) setLoading(true);
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
      push({ title: 'Erreur de chargement', message: 'Impossible de récupérer les données du tableau de bord.', status: 'error' });
      console.error("Error loading SGA dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [push]); // 'loading' is removed from dependencies to prevent re-triggering

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => {
    push({ title: 'Mise à jour', message: 'Rafraîchissement des données...', status: 'info' });
    fetchData();
  };

  // Définitions des colonnes et actions pour chaque section
  const programApprovalConfig = {
    columns: [
      { key: 'program', header: 'Programme' },
      { key: 'department', header: 'Département' },
      { key: 'status', header: 'Statut' },
    ],
    actions: [
      { label: 'Approuver', onClick: (row) => push({ title: 'Action', message: `Programme ${row.program} approuvé.` }) },
      { label: 'Rejeter', onClick: (row) => push({ title: 'Action', message: `Programme ${row.program} rejeté.` }) },
    ],
  };

  const enrollmentConfig = {
    columns: [
      { key: 'student', header: 'Étudiant' },
      { key: 'program', header: 'Programme' },
      { key: 'status', header: 'Statut' },
    ],
    actions: [{ label: 'Valider', onClick: (row) => push({ title: 'Action', message: `Inscription de ${row.student} validée.` }) }],
  };
  
  const deliberationConfig = {
    columns: [
      { key: 'faculty', header: 'Faculté/Section' },
      { key: 'date', header: 'Date Prévue' },
      { key: 'status', header: 'Statut' },
    ],
    actions: [{ label: 'Voir résultats', onClick: (row) => push({ title: 'Info', message: `Affichage des résultats pour ${row.faculty}.` }) }],
  };

  const calendarConfig = {
    columns: [
      { key: 'event', header: 'Événement' },
      { key: 'date', header: 'Date' },
    ],
    actions: [{ label: 'Planifier', onClick: (row) => push({ title: 'Action', message: `Planification de ${row.event}.` }) }],
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tableau de Bord SGA</h1>
        <button onClick={refreshData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50">
          <FaSync className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Rafraîchir</span>
        </button>
      </div>

      {/* Section KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading || !data.kpi ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : (
          <>
            <KpiCard label="Total Étudiants" value={data.kpi.totalStudents} icon={<FaUsers />} color="bg-blue-500" />
            <KpiCard label="Programmes à valider" value={data.kpi.programsToReview} icon={<FaBook />} color="bg-orange-500" />
            <KpiCard label="Total Enseignants" value={data.kpi.teachers} icon={<FaUsers />} color="bg-green-500" />
            <KpiCard label="Inscriptions en attente" value={data.kpi.pendingEnrollments} icon={<FaBook />} color="bg-yellow-500" />
          </>
        )}
      </div>

      {/* Grille de contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          <DashboardSection title="Approbation des Programmes" loading={loading} itemCount={data.programApprovals.length}>
            {data.programApprovals.length > 0 ? (
              data.programApprovals.map(item => <DataRow key={item.id} item={item} {...programApprovalConfig} />)
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">Aucun programme en attente.</p>
            )}
          </DashboardSection>

          <DashboardSection title="Calendrier Académique" loading={loading} itemCount={data.calendarEvents.length}>
            {data.calendarEvents.length > 0 ? (
              data.calendarEvents.map(item => <DataRow key={item.id} item={item} {...calendarConfig} />)
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">Aucun événement à venir.</p>
            )}
          </DashboardSection>
        </div>

        <div className="space-y-8">
          <DashboardSection title="Inscriptions Étudiantes" loading={loading} itemCount={data.enrollmentRequests.length}>
            {data.enrollmentRequests.length > 0 ? (
              data.enrollmentRequests.map(item => <DataRow key={item.id} item={item} {...enrollmentConfig} />)
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">Aucune demande d'inscription.</p>
            )}
          </DashboardSection>

          <DashboardSection title="Supervision des Délibérations" loading={loading} itemCount={data.deliberationSessions.length}>
            {data.deliberationSessions.length > 0 ? (
              data.deliberationSessions.map(item => <DataRow key={item.id} item={item} {...deliberationConfig} />)
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">Aucune délibération planifiée.</p>
            )}
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
