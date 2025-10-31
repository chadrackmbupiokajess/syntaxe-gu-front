import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from '../components/KpiCard';
import Skeleton from '../components/Skeleton';
import ListWithFilters from '../components/ListWithFilters'; // Re-importing for the dashboard
import GestionPedagogiqueDept from '../components/GestionPedagogiqueDept';
import GestionEnseignantsDept from '../components/GestionEnseignantsDept';
import GestionEtudiantsDept from '../components/GestionEtudiantsDept';
import AdministrationDept from '../components/AdministrationDept';

const TABS = {
  DASHBOARD: 'Tableau de bord',
  PEDAGOGIE: 'Gestion Pédagogique',
  ENSEIGNANTS: 'Enseignants',
  ETUDIANTS: 'Étudiants',
  ADMINISTRATION: 'Administration',
};

// Dummy data for teachers to display on the dashboard
const dummyTeachers = [
    { id: 1, name: 'Dr. Ada Lovelace', rank: 'Professeur', courses: 'PROG101, DBAS401', status: 'Actif' },
    { id: 2, name: 'Dr. Alan Turing', rank: 'Professeur', courses: 'PROG201', status: 'Actif' },
    { id: 3, name: 'Dr. Grace Hopper', rank: 'Chargé de cours', courses: 'PROG301', status: 'Actif' },
    { id: 4, name: 'Mr. John Doe', rank: 'Assistant', courses: 'TP PROG101', status: 'Congé' },
];

export default function DepartementDashboard() {
  const [sum, setSum] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch both summary and teachers list
      const summaryPromise = axios.get('/api/department/summary');
      // const teachersPromise = axios.get('/api/department/teachers');
      const [summaryResponse] = await Promise.all([summaryPromise]);

      setSum(summaryResponse.data);
      setTeachers(dummyTeachers); // Using dummy data for now

    } catch (error) {
      console.error("Failed to load department data", error);
      setSum({ students: 150, teachers: 12, courses: 25, kpis: { successRate: 88 } });
      setTeachers(dummyTeachers); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.DASHBOARD) {
      loadDashboardData();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case TABS.PEDAGOGIE:
        return <GestionPedagogiqueDept />;
      case TABS.ENSEIGNANTS:
        return <GestionEnseignantsDept />;
      case TABS.ETUDIANTS:
        return <GestionEtudiantsDept />;
      case TABS.ADMINISTRATION:
        return <AdministrationDept />;
      case TABS.DASHBOARD:
      default:
        return (
          <div className="grid gap-8">
            {/* KPIs remain at the top of the dashboard content */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCard label="Étudiants" value={sum?.students || 0} />
                <KpiCard label="Enseignants" value={sum?.teachers || 0} />
                <KpiCard label="Cours" value={sum?.courses || 0} />
                <KpiCard label="Taux de réussite (%)" value={sum?.kpis?.successRate || 'N/A'} />
              </div>
            )}

            {/* Teacher list directly on the dashboard */}
            <ListWithFilters
              title="Enseignants du Département"
              data={teachers}
              loading={loading}
              onRefresh={loadDashboardData}
              columns={[
                { key: 'name', header: 'Nom' },
                { key: 'rank', header: 'Grade' },
                { key: 'courses', header: 'Cours Attribués' },
                { key: 'status', header: 'Statut' },
              ]}
              filters={[
                { key: 'name', label: 'Nom', type: 'text' },
                { key: 'rank', label: 'Grade', type: 'text' },
              ]}
            />
          </div>
        );
    }
  };

  return (
    <div className="grid gap-8 p-8">
      <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord du Chef de Département</h1>

      <div className="flex border-b">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}
