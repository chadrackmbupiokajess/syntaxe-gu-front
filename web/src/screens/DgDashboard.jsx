import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'
import { useToast } from '../shared/ToastProvider'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dummy Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5c1.706 0 3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.55 23.55 0 0112 15c-1.63 0-3.2-.19-4.7-.545M12 14V7m-4 7H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v7a2 2 0 01-2 2h-4m-7 1v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChatAlt2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z" /></svg>;

export default function DgDashboard() {
  const { push } = useToast()
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  // State for General Stats
  const [generalStats, setGeneralStats] = useState({
    totalSections: 0,
    totalDepartments: 0,
    totalTeachers: 0,
    totalStudents: 0,
  });

  // Academic Reports states
  const [academicReports, setAcademicReports] = useState([
    { id: 1, type: 'Inscriptions', value: 1200, trend: '+5%' },
    { id: 2, type: 'Taux de réussite', value: '85%', trend: '+2%' },
    { id: 3, type: 'Abandons', value: 50, trend: '-10%' },
    { id: 4, type: 'Performance moyenne', value: 'B+', trend: 'Stable' },
  ]);
  const [academicTrendData, setAcademicTrendData] = useState([
    { name: 'Jan', Inscriptions: 4000, Reussite: 2400 },
    { name: 'Fev', Inscriptions: 3000, Reussite: 1398 },
    { name: 'Mar', Inscriptions: 2000, Reussite: 9800 },
    { name: 'Avr', Inscriptions: 2780, Reussite: 3908 },
    { name: 'Mai', Inscriptions: 1890, Reussite: 4800 },
    { name: 'Juin', Inscriptions: 2390, Reussite: 3800 },
    { name: 'Juil', Inscriptions: 3490, Reussite: 4300 },
  ]);
  const [loadingAcademicReports, setLoadingAcademicReports] = useState(true);

  // Financial Reports still use dummy data, as backend endpoints need to be clarified/created
  const [financialReports, setFinancialReports] = useState([
    { id: 1, type: 'Revenus', value: '1.5M USD', trend: '+10%' },
    { id: 2, type: 'Dépenses', value: '1.2M USD', trend: '+8%' },
    { id: 3, type: 'Budget restant', value: '0.3M USD', trend: '-5%' },
  ]);
  const [financialTrendData, setFinancialTrendData] = useState([
    { name: 'Jan', Revenus: 400, Depenses: 240 },
    { name: 'Fev', Revenus: 300, Depenses: 139 },
    { name: 'Mar', Revenus: 200, Depenses: 980 },
    { name: 'Avr', Revenus: 278, Depenses: 390 },
    { name: 'Mai', Revenus: 189, Depenses: 480 },
    { name: 'Juin', Revenus: 239, Depenses: 380 },
    { name: 'Juil', Revenus: 349, Depenses: 430 },
  ]);

  const [personnelManagement, setPersonnelManagement] = useState([]);
  const [loadingPersonnelManagement, setLoadingPersonnelManagement] = useState(true);


  const [validationItems, setValidationItems] = useState([
    { id: 1, type: 'Programme', description: 'Nouveau programme de Master en IA', status: 'En attente', date: '2023-10-26' },
    { id: 2, type: 'Répartition des cours', description: 'Répartition des cours semestre 1', status: 'En attente', date: '2023-10-25' },
    { id: 3, type: 'Résultats finaux', description: 'Validation résultats Licence 3', status: 'Approuvé', date: '2023-10-20' },
  ]);

  const [internalMessages, setInternalMessages] = useState([
    { id: 1, subject: 'Réunion du Conseil de Direction', content: 'La réunion aura lieu le 15 novembre...', sender: 'DG', date: '2023-10-24' },
    { id: 2, subject: 'Nouvelles directives budgétaires', content: 'Veuillez prendre note des nouvelles...', sender: 'DG', date: '2023-10-23' },
  ]);


  const load = async () => {
    setLoading(true);
    try {
      const [summaryRes, actionsRes, sectionsRes] = await Promise.all([
        axios.get('/api/dg/summary'),
        axios.get('/api/dg/actions'),
        axios.get('/api/section/list'), // To get totalSections
      ]);

      setSum(summaryRes.data);
      setRows(actionsRes.data);

      setGeneralStats({
        totalSections: sectionsRes.data.length,
        totalDepartments: summaryRes.data.totalDepartments,
        totalTeachers: summaryRes.data.totalTeachers,
        totalStudents: summaryRes.data.totalStudents,
      });

    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des données du tableau de bord.', status: 'error' });
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load Academic Reports
  useEffect(() => {
    const loadAcademicReports = async () => {
      setLoadingAcademicReports(true);
      try {
        // NOTE: These are hypothetical backend endpoints. You need to implement them.
        const [summaryRes, trendRes] = await Promise.all([
          axios.get('/api/dg/academic_reports_summary'),
          axios.get('/api/dg/academic_trend_data'),
        ]);

        // Assuming summaryRes.data is an object like { inscriptions: { value, trend }, success_rate: { value, trend }, ...}
        const mappedReports = [
          { id: 1, type: 'Inscriptions', value: summaryRes.data.inscriptions.value, trend: summaryRes.data.inscriptions.trend },
          { id: 2, type: 'Taux de réussite', value: summaryRes.data.success_rate.value, trend: summaryRes.data.success_rate.trend },
          { id: 3, type: 'Abandons', value: summaryRes.data.dropouts.value, trend: summaryRes.data.dropouts.trend },
          { id: 4, type: 'Performance moyenne', value: summaryRes.data.average_performance.value, trend: summaryRes.data.average_performance.trend },
        ];
        setAcademicReports(mappedReports);

        // Assuming trendRes.data is an array like [{ name: 'Jan', Inscriptions: 4000, Reussite: 2400 }, ...]
        setAcademicTrendData(trendRes.data);

      } catch (error) {
        push({ title: 'Erreur', message: 'Erreur lors du chargement des rapports académiques.', status: 'error' });
        console.error("Error loading academic reports:", error);
        // Keep dummy data if API call fails
      } finally {
        setLoadingAcademicReports(false);
      }
    };
    loadAcademicReports();
  }, []);


  // Effect to load Personnel Management
  useEffect(() => {
    const loadPersonnelManagement = async () => {
      setLoadingPersonnelManagement(true);
      try {
        const response = await axios.get('/api/users'); // Assuming /api/users returns a list of all users
        const personnelData = response.data.map(user => ({
          id: user.id,
          name: user.full_name, 
          role: user.role, 
          status: user.status, 
          email: user.email,
        }));
        setPersonnelManagement(personnelData);
      } catch (error) {
        push({ title: 'Erreur', message: 'Erreur lors du chargement de la gestion du personnel.', status: 'error' });
        console.error("Error loading personnel management:", error);
      } finally {
        setLoadingPersonnelManagement(false);
      }
    };
    loadPersonnelManagement();
  }, []);


  useEffect(()=>{ load() },[])

  return (
    <div className="grid gap-8">
      {/* Hero Section for Main KPIs */}
      {sum && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Décisions en attente" value={sum.decisionsPending} icon={<BriefcaseIcon />} color="bg-blue-600 dark:bg-blue-800" />
          <KpiCard label="Projets en cours" value={sum.projects} icon={<ChartBarIcon />} color="bg-green-600 dark:bg-green-800" />
          <KpiCard label="Budget utilisé (%)" value={sum.budgetUsed} icon={<BookOpenIcon />} color="bg-yellow-600 dark:bg-yellow-800" />
          <KpiCard label="Satisfaction Globale (%)" value={sum.satisfaction} icon={<CheckCircleIcon />} color="bg-purple-600 dark:bg-purple-800" />
        </div>
      )}

      {/* General Dashboard Section - Enhanced */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-5 text-black dark:text-white">Vue d'ensemble de l'établissement</h3>
        {loading ? (
          <Skeleton count={4} className="h-24" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Sections" value={generalStats.totalSections} color="bg-indigo-50 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200" />
            <KpiCard label="Total Départements" value={generalStats.totalDepartments} color="bg-teal-50 dark:bg-teal-900 text-teal-800 dark:text-teal-200" />
            <KpiCard label="Total Enseignants" value={generalStats.totalTeachers} color="bg-sky-50 dark:bg-sky-900 text-sky-800 dark:text-sky-200" />
            <KpiCard label="Total Étudiants" value={generalStats.totalStudents} color="bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-200" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Academic Reports Section - with Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-2xl font-bold mb-5 text-black dark:text-white">Rapports Académiques</h3>
          {loadingAcademicReports ? (
            <Skeleton count={4} className="h-24" />
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {academicReports.map(report => (
                <KpiCard key={report.id} label={report.type} value={report.value} trend={report.trend} color="bg-gray-50 dark:bg-gray-700 text-black dark:text-white" />
              ))}
            </div>
          )}
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart
                data={academicTrendData}
                margin={{
                  top: 10, right: 30, left: 0, bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#888888" className="dark:stroke-slate-400" />
                <YAxis stroke="#888888" className="dark:stroke-slate-400" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
                <Area type="monotone" dataKey="Inscriptions" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="Reussite" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Reports Section - with Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-2xl font-bold mb-5 text-black dark:text-white">Rapports Financiers</h3>
          {/* NOTE: This section still uses dummy data. Backend endpoints are needed for financial reports and trend data. */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {financialReports.map(report => (
              <KpiCard key={report.id} label={report.type} value={report.value} trend={report.trend} color="bg-gray-50 dark:bg-gray-700 text-black dark:text-white" />
            ))}
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart
                data={financialTrendData} 
                margin={{
                  top: 10, right: 30, left: 0, bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#888888" className="dark:stroke-slate-400" />
                <YAxis stroke="#888888" className="dark:stroke-slate-400" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
                <Area type="monotone" dataKey="Revenus" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="Depenses" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Personnel Management Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-5 text-black dark:text-white">Gestion du Personnel</h3>
        <ListWithFilters
          title="Liste du Personnel Clé"
          data={personnelManagement}
          loading={loadingPersonnelManagement}
          onRefresh={() => { /* Implement refresh for personnel data */ }}
          columns={[
            { key: 'name', header: 'Nom' },
            { key: 'role', header: 'Rôle' },
            { key: 'status', header: 'Statut' },
            { key: 'email', header: 'Email' },
          ]}
          actions={[
            { label: 'Voir Détails', onClick: (row) => push({ title: 'Détails Personnel', message: `Détails de ${row.name}` }) },
            { label: 'Désactiver', onClick: (row) => push({ title: 'Action', message: `Désactiver ${row.name}` }) },
          ]}
        />
      </div>

      {/* Validation Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-5 text-black dark:text-white">Validation et Approbation</h3>
        {/* NOTE: This section still uses dummy data. Backend endpoints are needed for validation items. */}
        <ListWithFilters
          title="Éléments en Attente de Validation"
          data={validationItems}
          loading={false}
          onRefresh={() => { /* No refresh for dummy data */ }}
          columns={[
            { key: 'type', header: 'Type' },
            { key: 'description', header: 'Description' },
            { key: 'status', header: 'Statut' },
            { key: 'date', header: 'Date' },
          ]}
          actions={[
            { label: 'Approuver', onClick: (row) => push({ title: 'Action', message: `Approuver: ${row.description}` }) },
            { label: 'Rejeter', onClick: (row) => push({ title: 'Action', message: `Rejeter: ${row.description}` }) },
          ]}
        />
      </div>

      {/* Communication Interne Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold mb-5 text-black dark:text-white">Communication Interne</h3>
        {/* NOTE: This section still uses dummy data. Backend endpoints are needed for internal messages. */}
        <div className="mb-4">
          <textarea
            className="w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
            rows="3"
            placeholder="Écrire un message officiel à tous les chefs..."
          ></textarea>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => push({ title: 'Message Envoyé', message: 'Message envoyé avec succès !' })}
          >
            Envoyer Message
          </button>
        </div>
        <ListWithFilters
          title="Messages Envoyés"
          data={internalMessages}
          loading={false}
          onRefresh={() => { /* No refresh for dummy data */ }}
          columns={[
            { key: 'date', header: 'Date' },
            { key: 'subject', header: 'Sujet' },
            { key: 'content', header: 'Contenu' },
          ]}
          actions={[
            { label: 'Voir', onClick: (row) => push({ title: row.subject, message: row.content }) },
          ]}
        />
      </div>


      {/* Existing Recent Actions List */}
      <ListWithFilters
        title="Actions récentes"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'date', header: 'Date' },
          { key: 'domaine', header: 'Domaine' },
          { key: 'action', header: 'Action' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'domaine', label: 'Domaine', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'text' },
        ]}
        actions={[
          { label: 'Détails', onClick: (row) => push({ title: 'Détails', message: row.action }) },
        ]}
      />
    </div>
  )
}
