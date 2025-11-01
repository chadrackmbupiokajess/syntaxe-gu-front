import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from '../components/KpiCard';
import Skeleton from '../components/Skeleton';
import ListWithFilters from '../components/ListWithFilters';
// Removed: GestionPedagogiqueDept, GestionEnseignantsDept, GestionEtudiantsDept, AdministrationDept
import { Link } from 'react-router-dom'; // Import Link for QuickActions

// --- SVG Icons for a more professional look ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5c1.706 0 3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const DocumentReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" /></svg>;

// --- New Components for a more professional look ---

const QuickActions = () => {
    const actions = [
        { title: 'Assigner Cours', to: '/departement/enseignants', icon: <ClipboardListIcon />, color: 'bg-blue-500' },
        { title: 'Valider Horaires', to: '/departement/pedagogie', icon: <CalendarIcon />, color: 'bg-green-500' },
        { title: 'Voir Étudiants', to: '/departement/etudiants', icon: <UsersIcon />, color: 'bg-yellow-500' },
        { title: 'Générer Rapport', to: '/departement/administration', icon: <DocumentReportIcon />, color: 'bg-purple-500' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map(action => (
                    <Link 
                        key={action.title} 
                        to={action.to}
                        className={`flex flex-col items-center justify-center p-4 ${action.color} text-white rounded-lg hover:opacity-90 transition-opacity duration-200 transform hover:scale-105`}
                    >
                        {action.icon}
                        <span className="mt-2 text-sm font-semibold text-center">{action.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const RecentActivities = ({ activities }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Activités Récentes</h3>
        <ul className="space-y-3">
            {activities.map(activity => (
                <li key={activity.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <BellIcon className="text-gray-500 dark:text-gray-400 mr-3" />
                    <div className="flex-grow">
                        <p className="text-gray-700 dark:text-gray-300">{activity.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

// Removed: TABS object

export default function DepartementDashboard() {
  const [sum, setSum] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed: [activeTab, setActiveTab]
  const departmentName = "Informatique"; // This could come from user context or API

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryResponse, teachersResponse, activitiesResponse] = await Promise.all([
        axios.get('/api/department/summary'),
        axios.get('/api/department/teachers'),
        axios.get('/api/department/activities'),
      ]);
      setSum(summaryResponse.data);
      setTeachers(teachersResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error("Failed to load department data", error);
      // Fallback to dummy data or empty arrays on error
      setSum({ students: { val: 0, trend: [] }, teachers: { val: 0, trend: [] }, courses: 0, successRate: { val: 'N/A', trend: [] } });
      setTeachers([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(); // Always load summary for the dashboard index
  }, []); // Empty dependency array to run once on mount

  // Removed: renderContent function

  return (
    <div className="grid gap-8">
      {/* Removed: h1 title */}
      {/* Removed: horizontal tabs div */}
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
          <KpiCard label="Étudiants" value={sum?.students?.val || 0} color="bg-blue-500" icon={<UsersIcon />} />
          <KpiCard label="Enseignants" value={sum?.teachers?.val || 0} color="bg-green-500" icon={<AcademicCapIcon />} />
          <KpiCard label="Cours" value={sum?.courses || 0} color="bg-orange-500" icon={<BookOpenIcon />} />
          <KpiCard label="Taux de réussite (%)" value={sum?.successRate?.val || 'N/A'} color="bg-purple-500" icon={<ChartBarIcon />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid gap-8">
              <QuickActions />
              <RecentActivities activities={recentActivities} />
          </div>
          <div className="lg:col-span-1">
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
                      { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex: Jess' },
                      { key: 'rank', label: 'Grade', type: 'text', placeholder: 'Grade' },
                  ]}
              />
          </div>
      </div>
    </div>
  );
}
