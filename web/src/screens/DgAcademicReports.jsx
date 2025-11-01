import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import ListWithFilters from '../components/ListWithFilters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Dummy Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

export default function DgAcademicReports() {
  // Dummy Data
  const [academicSummary] = useState({
    totalStudents: 15000,
    activeCourses: 350,
    avgSuccessRate: '82%',
    newEnrollments: 1200,
  });

  const [enrollmentTrend] = useState([
    { name: 'Jan', Étudiants: 4000 },
    { name: 'Fev', Étudiants: 3000 },
    { name: 'Mar', Étudiants: 2000 },
    { name: 'Avr', Étudiants: 2780 },
    { name: 'Mai', Étudiants: 1890 },
    { name: 'Juin', Étudiants: 2390 },
    { name: 'Juil', Étudiants: 3490 },
  ]);

  const [successRateByDepartment] = useState([
    { department: 'Informatique', 'Taux de Réussite': 90 },
    { department: 'Droit', 'Taux de Réussite': 75 },
    { department: 'Médecine', 'Taux de Réussite': 88 },
    { department: 'Économie', 'Taux de Réussite': 70 },
    { department: 'Lettres', 'Taux de Réussite': 85 },
  ]);

  const [lowPerformingCourses] = useState([
    { id: 1, name: 'Algorithmique Avancée', department: 'Informatique', successRate: '60%', students: 120 },
    { id: 2, name: 'Droit Constitutionnel II', department: 'Droit', successRate: '55%', students: 80 },
    { id: 3, name: 'Chimie Organique', department: 'Médecine', successRate: '62%', students: 150 },
  ]);

  const [topPerformingDepartments] = useState([
    { id: 1, name: 'Médecine', avgSuccessRate: '88%', totalStudents: 2500 },
    { id: 2, name: 'Informatique', avgSuccessRate: '85%', totalStudents: 3000 },
    { id: 3, name: 'Lettres', avgSuccessRate: '85%', totalStudents: 1800 },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Rapports Académiques</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Vue d'ensemble et analyse des performances académiques de l'établissement.</p>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Étudiants" value={academicSummary.totalStudents} icon={<UsersIcon />} color="bg-blue-600 dark:bg-blue-800" />
        <KpiCard label="Cours Actifs" value={academicSummary.activeCourses} icon={<AcademicCapIcon />} color="bg-green-600 dark:bg-green-800" />
        <KpiCard label="Taux de Réussite Moyen" value={academicSummary.avgSuccessRate} icon={<ChartBarIcon />} color="bg-purple-600 dark:bg-purple-800" />
        <KpiCard label="Nouvelles Inscriptions" value={academicSummary.newEnrollments} icon={<TrendingUpIcon />} color="bg-yellow-600 dark:bg-yellow-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollment Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Tendance des Inscriptions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#888888" className="dark:stroke-slate-400" />
              <YAxis stroke="#888888" className="dark:stroke-slate-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
              <Area type="monotone" dataKey="Étudiants" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate by Department Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Taux de Réussite par Département</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successRateByDepartment} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-slate-700" />
              <XAxis dataKey="department" stroke="#888888" className="dark:stroke-slate-400" />
              <YAxis stroke="#888888" className="dark:stroke-slate-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
              <Legend />
              <Bar dataKey="Taux de Réussite" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Performing Courses List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Cours à Faible Performance</h3>
        <ListWithFilters
          title=""
          data={lowPerformingCourses}
          columns={[
            { key: 'name', header: 'Nom du Cours' },
            { key: 'department', header: 'Département' },
            { key: 'successRate', header: 'Taux de Réussite' },
            { key: 'students', header: 'Étudiants Inscrits' },
          ]}
          filters={[
            { key: 'name', label: 'Cours', type: 'text', placeholder: 'Nom du cours' },
            { key: 'department', label: 'Département', type: 'text', placeholder: 'Département' },
          ]}
        />
      </div>

      {/* Top Performing Departments List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Départements les Plus Performants</h3>
        <ListWithFilters
          title=""
          data={topPerformingDepartments}
          columns={[
            { key: 'name', header: 'Nom du Département' },
            { key: 'avgSuccessRate', header: 'Taux de Réussite Moyen' },
            { key: 'totalStudents', header: 'Total Étudiants' },
          ]}
          filters={[
            { key: 'name', label: 'Département', type: 'text', placeholder: 'Département' },
          ]}
        />
      </div>
    </div>
  );
}
