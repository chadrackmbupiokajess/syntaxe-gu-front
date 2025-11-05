import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/configAxios';
import KpiCard from '../components/KpiCard';
import { useToast } from '../shared/ToastProvider';
import { FaBook, FaUsers, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';

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

export default function BibliothecaireDashboard() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpi: null,
    recentActivity: [],
    overdueBooks: [],
  });

  const fetchData = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      // Replace with actual API endpoints for the librarian
      const [kpiRes, recentActivityRes, overdueBooksRes] = await Promise.all([
        axios.get('/api/bibliothecaire/kpi'),
        axios.get('/api/bibliothecaire/recent-activity'),
        axios.get('/api/bibliothecaire/overdue-books'),
      ]);

      setData({
        kpi: kpiRes.data,
        recentActivity: recentActivityRes.data,
        overdueBooks: overdueBooksRes.data,
      });
    } catch (error) {
      push({ title: 'Erreur de chargement', message: 'Impossible de récupérer les données du tableau de bord.', status: 'error' });
      console.error("Error loading Bibliothecaire dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [push, loading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => {
    push({ title: 'Mise à jour', message: 'Rafraîchissement des données...', status: 'info' });
    fetchData();
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tableau de Bord Bibliothèque</h1>
        <button onClick={refreshData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50">
          <FaSync className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Rafraîchir</span>
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading || !data.kpi ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : (
          <>
            <KpiCard label="Livres Disponibles" value={data.kpi.availableBooks} icon={<FaBook />} color="blue" />
            <KpiCard label="Livres Empruntés" value={data.kpi.borrowedBooks} icon={<FaBook />} color="orange" />
            <KpiCard label="Membres Actifs" value={data.kpi.activeMembers} icon={<FaUsers />} color="green" />
            <KpiCard label="Retards de Retour" value={data.kpi.overdueReturns} icon={<FaExclamationTriangle />} color="red" />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardSection title="Activité Récente" loading={loading} itemCount={data.recentActivity.length}>
          {/* Render recent activity data here */}
          <p className="p-4 text-sm text-center text-gray-500">Aucune activité récente.</p>
        </DashboardSection>

        <DashboardSection title="Livres en Retard" loading={loading} itemCount={data.overdueBooks.length}>
          {/* Render overdue books data here */}
          <p className="p-4 text-sm text-center text-gray-500">Aucun livre en retard.</p>
        </DashboardSection>
      </div>
    </div>
  );
}
