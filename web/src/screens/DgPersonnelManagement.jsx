import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import ListWithFilters from '../components/ListWithFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Dummy Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const UserAddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const UserRemoveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.55 23.55 0 0112 15c-1.63 0-3.2-.19-4.7-.545M12 14V7m-4 7H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v7a2 2 0 01-2 2h-4m-7 1v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6" /></svg>;

export default function DgPersonnelManagement() {
  // Dummy Data
  const [personnelSummary] = useState({
    totalStaff: 500,
    activeStaff: 480,
    newHiresLastMonth: 15,
    departuresLastMonth: 5,
    turnoverRate: '1.5%',
  });

  const [staffDistributionByRole] = useState([
    { name: 'Professeurs', value: 200, color: '#8884d8' },
    { name: 'Assistants', value: 150, color: '#82ca9d' },
    { name: 'Administratifs', value: 100, color: '#ffc658' },
    { name: 'Techniques', value: 50, color: '#ff7300' },
  ]);

  const [hiringDepartureTrend] = useState([
    { name: 'Jan', Embauches: 5, Départs: 2 },
    { name: 'Fev', Embauches: 7, Départs: 3 },
    { name: 'Mar', Embauches: 10, Départs: 4 },
    { name: 'Avr', Embauches: 8, Départs: 2 },
    { name: 'Mai', Embauches: 12, Départs: 5 },
    { name: 'Juin', Embauches: 15, Départs: 5 },
    { name: 'Juil', Embauches: 10, Départs: 3 },
  ]);

  const [recentHires] = useState([
    { id: 1, name: 'Dr. Alice Smith', role: 'Professeur', department: 'Informatique', date: '2023-10-15' },
    { id: 2, name: 'M. Bob Johnson', role: 'Assistant', department: 'Physique', date: '2023-10-20' },
    { id: 3, name: 'Mme. Carol White', role: 'Secrétaire', department: 'Administration', date: '2023-10-22' },
  ]);

  const [staffChanges] = useState([
    { id: 1, name: 'Dr. David Green', type: 'Promotion', details: 'De Assistant à Professeur', date: '2023-10-10' },
    { id: 2, name: 'Mme. Eve Black', type: 'Départ', details: 'Retraite', date: '2023-10-05' },
    { id: 3, name: 'M. Frank Blue', type: 'Transfert', details: 'Vers le département de Chimie', date: '2023-10-01' },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion du Personnel</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Supervisez et gérez l'ensemble du personnel de l'université.</p>

      {/* Global Personnel KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Personnel" value={personnelSummary.totalStaff} icon={<UsersIcon />} color="bg-blue-600 dark:bg-blue-800" />
        <KpiCard label="Personnel Actif" value={personnelSummary.activeStaff} icon={<BriefcaseIcon />} color="bg-green-600 dark:bg-green-800" />
        <KpiCard label="Nouvelles Embauches (Mois)" value={personnelSummary.newHiresLastMonth} icon={<UserAddIcon />} color="bg-yellow-600 dark:bg-yellow-800" />
        <KpiCard label="Départs (Mois)" value={personnelSummary.departuresLastMonth} icon={<UserRemoveIcon />} color="bg-red-600 dark:bg-red-800" />
        <KpiCard label="Taux de Rotation" value={personnelSummary.turnoverRate} icon={<BriefcaseIcon />} color="bg-purple-600 dark:bg-purple-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staff Distribution by Role Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-black dark:text-white">
          <h3 className="text-xl font-bold mb-4">Répartition du Personnel par Rôle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staffDistributionByRole}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {staffDistributionByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} /> {/* Changed to always white */}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring/Departure Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Tendance Embauches / Départs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hiringDepartureTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#888888" className="dark:stroke-slate-400" />
              <YAxis stroke="#888888" className="dark:stroke-slate-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} /> {/* Changed to always white */}
              <Bar dataKey="Embauches" fill="#82ca9d" />
              <Bar dataKey="Départs" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Hires List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Nouvelles Embauches Récentes</h3>
        <ListWithFilters
          title=""
          data={recentHires}
          columns={[
            { key: 'name', header: 'Nom' },
            { key: 'role', header: 'Rôle' },
            { key: 'department', header: 'Département' },
            { key: 'date', header: 'Date d\'embauche' },
          ]}
          filters={[
            { key: 'name', label: 'Nom', type: 'text', placeholder: 'Nom' },
            { key: 'department', label: 'Département', type: 'text', placeholder: 'Département' },
          ]}
        />
      </div>

      {/* Staff Changes List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Changements de Personnel Récents</h3>
        <ListWithFilters
          title=""
          data={staffChanges}
          columns={[
            { key: 'name', header: 'Nom' },
            { key: 'type', header: 'Type de Changement' },
            { key: 'details', header: 'Détails' },
            { key: 'date', header: 'Date' },
          ]}
          filters={[
            { key: 'name', label: 'Nom', type: 'text', placeholder: 'Nom' },
            { key: 'type', label: 'Type', type: 'select', options: [{ value: 'Promotion', label: 'Promotion' }, { value: 'Départ', label: 'Départ' }, { value: 'Transfert', label: 'Transfert' }] },
          ]}
        />
      </div>
    </div>
  );
}
