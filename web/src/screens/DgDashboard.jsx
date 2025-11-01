import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'
import { useToast } from '../shared/ToastProvider'

export default function DgDashboard() {
  const { push } = useToast()
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  // Dummy data for new functionalities
  const [generalStats, setGeneralStats] = useState({
    totalSections: 10,
    totalDepartments: 30,
    totalTeachers: 150,
    totalStudents: 5000,
  });

  const [academicReports, setAcademicReports] = useState([
    { id: 1, type: 'Inscriptions', value: 1200, trend: '+5%' },
    { id: 2, type: 'Taux de réussite', value: '85%', trend: '+2%' },
    { id: 3, type: 'Abandons', value: 50, trend: '-10%' },
    { id: 4, type: 'Performance moyenne', value: 'B+', trend: 'Stable' },
  ]);

  const [financialReports, setFinancialReports] = useState([
    { id: 1, type: 'Revenus', value: '1.5M USD', trend: '+10%' },
    { id: 2, type: 'Dépenses', value: '1.2M USD', trend: '+8%' },
    { id: 3, type: 'Budget restant', value: '0.3M USD', trend: '-5%' },
  ]);

  const [personnelManagement, setPersonnelManagement] = useState([
    { id: 1, name: 'Dr. Jean Dupont', role: 'Chef de Section Informatique', status: 'Active', email: 'jean.dupont@univ.com' },
    { id: 2, name: 'Prof. Marie Curie', role: 'Chef de Département Physique', status: 'Active', email: 'marie.curie@univ.com' },
    { id: 3, name: 'Mme. Sophie Martin', role: 'Secrétaire Académique', status: 'Active', email: 'sophie.martin@univ.com' },
    { id: 4, name: 'M. Pierre Dubois', role: 'Comptable Principal', status: 'Active', email: 'pierre.dubois@univ.com' },
  ]);

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
    setLoading(true)
    try {
      const [s, r] = await Promise.all([
        axios.get('/api/dg/summary'),
        axios.get('/api/dg/actions'),
      ])
      setSum(s.data); setRows(r.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load() },[])

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold mb-4">Tableau de bord du Directeur Général</h2>

      {/* Existing KPI Cards */}
      {!sum ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-20"/>
          <Skeleton className="h-20"/>
          <Skeleton className="h-20"/>
          <Skeleton className="h-20"/>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Décisions en attente" value={sum.decisionsPending} />
          <KpiCard label="Projets" value={sum.projects} />
          <KpiCard label="Budget utilisé (%)" value={sum.budgetUsed} />
          <KpiCard label="Satisfaction (%)" value={sum.satisfaction} />
        </div>
      )}

      {/* General Dashboard Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Vue d'ensemble de l'établissement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total Sections" value={generalStats.totalSections} />
          <KpiCard label="Total Départements" value={generalStats.totalDepartments} />
          <KpiCard label="Total Enseignants" value={generalStats.totalTeachers} />
          <KpiCard label="Total Étudiants" value={generalStats.totalStudents} />
        </div>
      </div>

      {/* Academic Reports Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Rapports Académiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {academicReports.map(report => (
            <KpiCard key={report.id} label={report.type} value={report.value} trend={report.trend} />
          ))}
        </div>
      </div>

      {/* Financial Reports Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Rapports Financiers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {financialReports.map(report => (
            <KpiCard key={report.id} label={report.type} value={report.value} trend={report.trend} />
          ))}
        </div>
      </div>

      {/* Personnel Management Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Gestion du Personnel</h3>
        <ListWithFilters
          title="Liste du Personnel Clé"
          data={personnelManagement}
          loading={false} // Dummy data, so not loading
          onRefresh={() => { /* No refresh for dummy data */ }}
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
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Validation et Approbation</h3>
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
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Communication Interne</h3>
        <div className="mb-4">
          <textarea
            className="w-full p-2 border rounded-md"
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