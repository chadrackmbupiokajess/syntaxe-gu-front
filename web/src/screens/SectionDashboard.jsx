import React, { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard';
import Skeleton from '../components/Skeleton';
import GestionPedagogique from '../components/GestionPedagogique';
import SupervisionDepartements from '../components/SupervisionDepartements';
import GestionEnseignants from '../components/GestionEnseignants';
import GestionEtudiants from '../components/GestionEtudiants';
import CoordinationAdministrative from '../components/CoordinationAdministrative';

// --- Sub-components for the main dashboard ---

const Sparkline = ({ data, color = "#4f46e5" }) => (
    <svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <polyline fill="none" stroke={color} strokeWidth="2" points={data.map((p, i) => `${(i / (data.length - 1)) * 100},${30 - (p / 100) * 28}`).join(' ')}/>
    </svg>
);

const QuickActions = ({ onNavigate }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onNavigate(TABS.PEDAGOGIE)} className="text-center py-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg">Valider Horaires</button>
            <button onClick={() => onNavigate(TABS.ADMINISTRATION)} className="text-center py-4 bg-teal-50 hover:bg-teal-100 rounded-lg">Envoyer Message</button>
            <button onClick={() => onNavigate(TABS.ETUDIANTS)} className="text-center py-4 bg-sky-50 hover:bg-sky-100 rounded-lg">Gérer Étudiants</button>
            <button onClick={() => onNavigate(TABS.ENSEIGNANTS)} className="text-center py-4 bg-amber-50 hover:bg-amber-100 rounded-lg">Voir Enseignants</button>
        </div>
    </div>
);

const Alerts = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Alertes & Approbations</h3>
        <ul className="space-y-3">
            <li className="flex items-center justify-between p-2 bg-red-100 rounded-md"><span>Rapport mensuel en retard (Prog)</span><button className="text-xs font-bold text-red-700">Relancer</button></li>
            <li className="flex items-center justify-between p-2 bg-yellow-100 rounded-md"><span>Demande de congé (Dr. Cerf)</span><button className="text-xs font-bold text-yellow-700">Voir</button></li>
        </ul>
    </div>
);

const RecentActivity = () => (
    <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
        <h3 className="font-bold text-lg mb-4">Activité Récente</h3>
        <ul className="space-y-2 text-sm text-gray-600">
            <li><span className="font-semibold">[Systèmes]</span> Le rapport d'activité de Mai a été soumis.</li>
            <li><span className="font-semibold">[Étudiants]</span> 5 nouvelles inscriptions en G1.</li>
            <li><span className="font-semibold">[Pédagogie]</span> Le cours 'IA Avancée' a été ajouté au programme de L2.</li>
        </ul>
    </div>
);

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
      await new Promise(resolve => setTimeout(resolve, 500));
      setSum({ students: { val: 355, trend: [60, 70, 80, 75, 85] }, teachers: { val: 27, trend: [80, 75, 78, 85, 90] }, departments: 3, successRate: { val: '85%', trend: [70, 75, 85, 82, 85] } });
    } catch (error) {
      console.error("Failed to load summary data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.DASHBOARD) { loadSummary(); }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case TABS.PEDAGOGIE: return <GestionPedagogique />;
      case TABS.DEPARTEMENTS: return <SupervisionDepartements />;
      case TABS.ENSEIGNANTS: return <GestionEnseignants />;
      case TABS.ETUDIANTS: return <GestionEtudiants />;
      case TABS.ADMINISTRATION: return <CoordinationAdministrative />;
      case TABS.DASHBOARD:
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loading ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
            ) : (
              <>
                <KpiCard label="Étudiants" value={sum?.students.val}><Sparkline data={sum?.students.trend} /></KpiCard>
                <KpiCard label="Enseignants" value={sum?.teachers.val}><Sparkline data={sum?.teachers.trend} /></KpiCard>
                <KpiCard label="Taux de Réussite" value={sum?.successRate.val}><Sparkline data={sum?.successRate.trend} color="#10b981" /></KpiCard>
                <KpiCard label="Départements" value={sum?.departments} />
              </>
            )}
            <div className="md:col-span-2"><QuickActions onNavigate={setActiveTab} /></div>
            <div className="md:col-span-2"><Alerts /></div>
            <div className="md:col-span-4"><RecentActivity /></div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
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
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
