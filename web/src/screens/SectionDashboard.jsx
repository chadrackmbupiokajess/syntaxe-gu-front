import React, { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard';
import Skeleton from '../components/Skeleton';
import GestionPedagogique from '../components/GestionPedagogique';
import SupervisionDepartements from '../components/SupervisionDepartements';
import GestionEnseignants from '../components/GestionEnseignants';
import GestionEtudiants from '../components/GestionEtudiants';
import CoordinationAdministrative from '../components/CoordinationAdministrative';

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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  const loadSummary = async () => {
    setLoading(true);
    try {
      // This is a mock summary. In a real app, it would be fetched via API.
      setSum({ students: 355, teachers: 27, departments: 3, kpis: { successRate: '85%' } });
    } catch (error) {
      console.error("Failed to load summary data", error);
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
            <div className="p-6 bg-gray-50 rounded-lg mt-4">
              <h3 className="font-semibold text-xl text-gray-800">Bienvenue, Chef de Section</h3>
              <p className="text-gray-600 mt-2">
                Utilisez les onglets ci-dessus pour naviguer entre les différentes fonctionnalités de gestion de votre section.
                Ce tableau de bord centralise toutes les informations clés pour vous aider dans votre mission.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord du Chef de Section</h1>

      <div className="flex border-b overflow-x-auto">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${
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
