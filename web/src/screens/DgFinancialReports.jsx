import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import ListWithFilters from '../components/ListWithFilters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

// Dummy Icons
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 12v-1m-5.657-2.343a4 4 0 000 5.656m11.314-11.314a4 4 0 000 5.656M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-3" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

export default function DgFinancialReports() {
  // Dummy Data
  const [financialSummary] = useState({
    totalRevenue: '2.5M USD',
    totalExpenses: '1.8M USD',
    netProfit: '0.7M USD',
    budgetVariance: '+5%',
  });

  const [revenueExpensesTrend] = useState([
    { name: 'Jan', Revenus: 500000, Dépenses: 300000 },
    { name: 'Fev', Revenus: 450000, Dépenses: 280000 },
    { name: 'Mar', Revenus: 600000, Dépenses: 400000 },
    { name: 'Avr', Revenus: 550000, Dépenses: 350000 },
    { name: 'Mai', Revenus: 700000, Dépenses: 480000 },
    { name: 'Juin', Revenus: 650000, Dépenses: 420000 },
    { name: 'Juil', Revenus: 750000, Dépenses: 500000 },
  ]);

  const [budgetAllocation] = useState([
    { name: 'Salaires', value: 400000, color: '#8884d8' },
    { name: 'Pédagogie', value: 250000, color: '#82ca9d' },
    { name: 'Infrastructure', value: 200000, color: '#ffc658' },
    { name: 'Recherche', value: 100000, color: '#ff7300' },
    { name: 'Marketing', value: 50000, color: '#d0ed57' },
  ]);

  const [recentTransactions] = useState([
    { id: 1, date: '2023-10-26', description: 'Paiement salaires Octobre', amount: '-150,000 USD', type: 'Dépense' },
    { id: 2, date: '2023-10-25', description: 'Frais d\'inscription étudiants', amount: '+50,000 USD', type: 'Revenu' },
    { id: 3, date: '2023-10-24', description: 'Achat équipement labo', amount: '-20,000 USD', type: 'Dépense' },
    { id: 4, date: '2023-10-23', description: 'Subvention gouvernementale', amount: '+100,000 USD', type: 'Revenu' },
  ]);

  const [budgetVariances] = useState([
    { id: 1, category: 'Salaires', budgeted: '400,000 USD', actual: '410,000 USD', variance: '-10,000 USD', status: 'Dépassement' },
    { id: 2, category: 'Pédagogie', budgeted: '250,000 USD', actual: '230,000 USD', variance: '+20,000 USD', status: 'Économie' },
    { id: 3, category: 'Infrastructure', budgeted: '200,000 USD', actual: '195,000 USD', variance: '+5,000 USD', status: 'Économie' },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Rapports Financiers</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Analyse détaillée des performances financières et de la gestion budgétaire.</p>

      {/* Global Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenus Totaux" value={financialSummary.totalRevenue} icon={<DollarSignIcon />} color="bg-green-600 dark:bg-green-800" />
        <KpiCard label="Dépenses Totales" value={financialSummary.totalExpenses} icon={<TrendingDownIcon />} color="bg-red-600 dark:bg-red-800" />
        <KpiCard label="Bénéfice Net" value={financialSummary.netProfit} icon={<WalletIcon />} color="bg-blue-600 dark:bg-blue-800" />
        <KpiCard label="Écart Budgétaire" value={financialSummary.budgetVariance} icon={<TrendingUpIcon />} color="bg-purple-600 dark:bg-purple-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Expenses Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Tendance Revenus vs Dépenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueExpensesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#888888" className="dark:stroke-slate-400" />
              <YAxis stroke="#888888" className="dark:stroke-slate-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
              <Area type="monotone" dataKey="Revenus" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="Dépenses" stackId="1" stroke="#ff7300" fill="#ff7300" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Allocation Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-black dark:text-white">
          <h3 className="text-xl font-bold mb-4">Répartition Budgétaire</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {budgetAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} /> {/* Changed to always white */}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Transactions Récentes</h3>
        <ListWithFilters
          title=""
          data={recentTransactions}
          columns={[
            { key: 'date', header: 'Date' },
            { key: 'description', header: 'Description' },
            { key: 'amount', header: 'Montant' },
            { key: 'type', header: 'Type' },
          ]}
          filters={[
            { key: 'description', label: 'Description', type: 'text', placeholder: 'Description' },
            { key: 'type', label: 'Type', type: 'select', options: [{ value: 'Revenu', label: 'Revenu' }, { value: 'Dépense', label: 'Dépense' }] },
          ]}
        />
      </div>

      {/* Budget Variances List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Écarts Budgétaires</h3>
        <ListWithFilters
          title=""
          data={budgetVariances}
          columns={[
            { key: 'category', header: 'Catégorie' },
            { key: 'budgeted', header: 'Budgétisé' },
            { key: 'actual', header: 'Réel' },
            { key: 'variance', header: 'Écart' },
            { key: 'status', header: 'Statut' },
          ]}
          filters={[
            { key: 'category', label: 'Catégorie', type: 'text', placeholder: 'Catégorie' },
            { key: 'status', label: 'Statut', type: 'select', options: [{ value: 'Dépassement', label: 'Dépassement' }, { value: 'Économie', label: 'Économie' }] },
          ]}
        />
      </div>
    </div>
  );
}
