import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from '../components/KpiCard';
import Skeleton from '../components/Skeleton';
import GestionPedagogique from '../components/GestionPedagogique';
import SupervisionDepartements from '../components/SupervisionDepartements';
import GestionEnseignants from '../components/GestionEnseignants';

// Placeholder components for the new features
const GestionEtudiants = () => <div className="p-4 bg-gray-100 rounded-lg">Fonctionnalités de gestion des étudiants à venir.</div>;
const CoordinationAdministrative = () => <div className="p-4 bg-gray-100 rounded-lg">Fonctionnalités de coordination administrative à venir.</div>;

const TABS = {
  DASHBOARD: 'Tableau de bord',
  PEDAGOGIE: 'Gestion Pédagogique',
  DEPARTEMENTS: 'Supervision des Départements',
  ENSEIGNANTS: 'Gestion des Enseignants',
  ETUDIANTS: 'Gestion des Étudiants',
  ADMINISTRATION: 'Coordination Administrative',
};

export default function SectionDashboard() {
  const [sum, setSum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/section/summary');
      setSum(response.data);
    } catch (error) {
      console.error("Failed to load summary data", error);
      // Handle error appropriately in a real app
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.DASHBOARD) {
        loadSummary();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case TABS.PEDAGOGIE:
        return <GestionPedagogique />;
      case TABS.DEPARTEMENTS:
        return <SupervisionDepartements />;
      case TABS.ENSEIGNANTS:
        return <GestionEnseignants />;
      case TABS.ETUDIANTS:
        return <GestionEtudiants />;
      case TABS.ADMINISTRATION:
        return <CoordinationAdministrative />;
      case TABS.DASHBOARD:
      default:
        return (
            <div className="grid gap-8">
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
                    <KpiCard label="Départements" value={sum?.departments || 0} />
                    <KpiCard label="Taux de réussite (%)" value={sum?.kpis?.successRate || 'N/A'} />
                    </div>
                )}
                 {/* You can add more dashboard-specific content here */}
                 <p>Vue d'ensemble du tableau de bord à venir.</p>
            </div>
        );
    }
  };

  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord du Chef de Section</h1>

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
