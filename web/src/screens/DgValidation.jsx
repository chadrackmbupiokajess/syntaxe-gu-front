import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import ListWithFilters from '../components/ListWithFilters';

// Dummy Icons
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 11-18 0 9 9 0 0118 0z" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;

export default function DgValidation() {
  // Dummy Data
  const [validationSummary] = useState({
    pendingValidations: 12,
    approvedLastMonth: 45,
    rejectedLastMonth: 3,
    totalValidated: 500,
  });

  const [pendingItems] = useState([
    { id: 1, type: 'Programme', description: 'Nouveau programme de Master en IA', requestedBy: 'Chef Section Info', date: '2023-10-26', status: 'En attente' },
    { id: 2, type: 'Budget', description: 'Demande de budget labo Physique', requestedBy: 'Chef Département Physique', date: '2023-10-25', status: 'En attente' },
    { id: 3, type: 'Nomination', description: 'Nomination Dr. Diallo (Professeur)', requestedBy: 'Secrétaire Général', date: '2023-10-24', status: 'En attente' },
    { id: 4, type: 'Convention', description: 'Convention de partenariat Google', requestedBy: 'Direction Partenariats', date: '2023-10-23', status: 'En attente' },
  ]);

  const [recentDecisions] = useState([
    { id: 1, type: 'Programme', description: 'Programme Licence 3 révisé', decision: 'Approuvé', date: '2023-10-20', decidedBy: 'DG' },
    { id: 2, type: 'Recrutement', description: 'Recrutement 2 assistants', decision: 'Approuvé', date: '2023-10-18', decidedBy: 'DG' },
    { id: 3, type: 'Budget', description: 'Budget événement sportif', decision: 'Rejeté', date: '2023-10-15', decidedBy: 'DG' },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Validation & Approbation</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Gérez les demandes de validation et d'approbation de l'établissement.</p>

      {/* Global Validation KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Validations en Attente" value={validationSummary.pendingValidations} icon={<ClockIcon />} color="bg-orange-600 dark:bg-orange-800" />
        <KpiCard label="Approuvées (Mois)" value={validationSummary.approvedLastMonth} icon={<CheckCircleIcon />} color="bg-green-600 dark:bg-green-800" />
        <KpiCard label="Rejetées (Mois)" value={validationSummary.rejectedLastMonth} icon={<BanIcon />} color="bg-red-600 dark:bg-red-800" />
        <KpiCard label="Total Validé" value={validationSummary.totalValidated} icon={<DocumentTextIcon />} color="bg-blue-600 dark:bg-blue-800" />
      </div>

      {/* Pending Validation Items List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Éléments en Attente de Validation</h3>
        <ListWithFilters
          title=""
          data={pendingItems}
          columns={[
            { key: 'type', header: 'Type' },
            { key: 'description', header: 'Description' },
            { key: 'requestedBy', header: 'Demandé par' },
            { key: 'date', header: 'Date' },
            { key: 'status', header: 'Statut' },
          ]}
          filters={[
            { key: 'type', label: 'Type', type: 'text', placeholder: 'Type' },
            { key: 'status', label: 'Statut', type: 'select', options: [{ value: 'En attente', label: 'En attente' }] },
          ]}
          actions={[
            { label: 'Approuver', onClick: (row) => alert(`Approuver: ${row.description}`) },
            { label: 'Rejeter', onClick: (row) => alert(`Rejeter: ${row.description}`) },
            { label: 'Détails', onClick: (row) => alert(`Détails: ${row.description}`) },
          ]}
        />
      </div>

      {/* Recent Decisions List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Décisions Récentes</h3>
        <ListWithFilters
          title=""
          data={recentDecisions}
          columns={[
            { key: 'date', header: 'Date' },
            { key: 'type', header: 'Type' },
            { key: 'description', header: 'Description' },
            { key: 'decision', header: 'Décision' },
            { key: 'decidedBy', header: 'Décidé par' },
          ]}
          filters={[
            { key: 'type', label: 'Type', type: 'text', placeholder: 'Type' },
            { key: 'decision', label: 'Décision', type: 'select', options: [{ value: 'Approuvé', label: 'Approuvé' }, { value: 'Rejeté', label: 'Rejeté' }] },
          ]}
          actions={[
            { label: 'Voir', onClick: (row) => alert(`Voir décision: ${row.description}`) },
          ]}
        />
      </div>
    </div>
  );
}
