import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import KpiCard from '../components/KpiCard';
import Skeleton from '../components/Skeleton';
// Removed: GestionPedagogique, SupervisionDepartements, GestionEnseignants, GestionEtudiants, CoordinationAdministrative
import { Link } from 'react-router-dom'; // Import Link for QuickActions

// --- Sub-components for the main dashboard ---

const Sparkline = ({ data, color = "#4f46e5" }) => (
    <svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <polyline fill="none" stroke={color} strokeWidth="2" points={data.map((p, i) => `${(i / (data.length - 1)) * 100},${30 - (p / 100) * 28}`).join(' ')}/>
    </svg>
);

const QuickActions = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-black dark:text-white">
        <h3 className="font-bold text-lg mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 gap-4">
            <Link to="/section/pedagogie" className="text-center py-4 bg-indigo-50 dark:bg-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg text-black dark:text-white">Valider Horaires</Link>
            <Link to="/section/administration" className="text-center py-4 bg-teal-50 dark:bg-teal-900 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-lg text-black dark:text-white">Envoyer Message</Link>
            <Link to="/section/etudiants" className="text-center py-4 bg-sky-50 dark:bg-sky-900 hover:bg-sky-100 dark:hover:bg-sky-800 rounded-lg text-black dark:text-white">Gérer Étudiants</Link>
            <Link to="/section/enseignants" className="text-center py-4 bg-amber-50 dark:bg-amber-900 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-lg text-black dark:text-white">Voir Enseignants</Link>
        </div>
    </div>
);

const Alerts = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-black dark:text-white">
        <h3 className="font-bold text-lg mb-4">Alertes & Approbations</h3>
        <ul className="space-y-3">
            <li className="flex items-center justify-between p-2 bg-red-100 dark:bg-red-900 rounded-md"><span>Rapport mensuel en retard (Prog)</span><button className="text-xs font-bold text-red-700 dark:text-red-300">Relancer</button></li>
            <li className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md"><span>Demande de congé (Dr. Cerf)</span><button className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Voir</button></li>
        </ul>
    </div>
);

const RecentActivity = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2 text-black dark:text-white">
        <h3 className="font-bold text-lg mb-4">Activité Récente</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><span className="font-semibold">[Systèmes]</span> Le rapport d'activité de Mai a été soumis.</li>
            <li><span className="font-semibold">[Étudiants]</span> 5 nouvelles inscriptions en G1.</li>
            <li><span className="font-semibold">[Pédagogie]</span> Le cours 'IA Avancée' a été ajouté au programme de L2.</li>
        </ul>
    </div>
);

// Removed: TABS object

export default function SectionDashboard() {
  const [sum, setSum] = useState(null);
  const [loading, setLoading] = useState(false);
  // Removed: [activeTab, setActiveTab]

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/section/summary');
      setSum(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement du résumé de la section:", error);
      // Optionnel: afficher un message d'erreur à l'utilisateur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(); // Always load summary for the dashboard index
  }, []); // Empty dependency array to run once on mount

  // Removed: renderContent function

  return (
    <div className="space-y-8">
      {/* Removed: h1 title */}
      {/* Removed: horizontal tabs div */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading || !sum ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <KpiCard label="Étudiants" value={sum.students.val} color="blue"><Sparkline data={sum.students.trend} /></KpiCard>
            <KpiCard label="Enseignants" value={sum.teachers.val} color="green"><Sparkline data={sum.teachers.trend} /></KpiCard>
            <KpiCard label="Taux de Réussite" value={sum.successRate.val} color="red"><Sparkline data={sum.successRate.trend} color="#10b981" /></KpiCard>
            <KpiCard label="Départements" value={sum.departments} color="orange" />
          </>
        )}
        <div className="md:col-span-2"><QuickActions /></div>
        <div className="md:col-span-2"><Alerts /></div>
        <div className="md:col-span-4"><RecentActivity /></div>
      </div>
    </div>
  );
}
