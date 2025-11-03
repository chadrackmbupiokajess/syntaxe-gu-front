import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListWithFilters from '../components/ListWithFilters';
import Skeleton from '../components/Skeleton';
import { useToast } from '../shared/ToastProvider';

export default function SgaAuditoires() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [auditoires, setAuditoires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [selectedSectionName, setSelectedSectionName] = useState('');

  const fetchDepartements = async () => {
    try {
      const response = await axios.get('/api/sga/departements');
      setDepartements(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des départements.', status: 'error' });
      console.error("Error loading departments:", error);
    }
  };

  const fetchAuditoires = async (departementId = '') => {
    setLoading(true);
    try {
      const url = departementId ? `/api/sga/auditoires?departement_id=${departementId}` : '/api/sga/auditoires';
      const response = await axios.get(url);
      setAuditoires(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des auditoires.', status: 'error' });
      console.error("Error loading auditoires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartements();
    fetchAuditoires();
  }, []);

  const handleDepartementChange = (e) => {
    const deptId = e.target.value;
    setSelectedDepartement(deptId);
    const dept = departements.find(d => String(d.id) === deptId);
    setSelectedSectionName(dept ? dept.section : '');
    fetchAuditoires(deptId);
  };

  const handleClearFilter = () => {
    setSelectedDepartement('');
    setSelectedSectionName('');
    fetchAuditoires(); // Fetch all auditoires
  };

  const refreshData = () => {
    fetchAuditoires(selectedDepartement);
    push({ title: 'Données rafraîchies', status: 'success' });
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Auditoires & Horaires</h2>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label htmlFor="departement-select" className="text-black dark:text-white font-medium">Filtrer par Département :</label>
          <select
            id="departement-select"
            className="p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDepartement}
            onChange={handleDepartementChange}
          >
            <option value="">Tous les Départements</option>
            {departements.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {selectedSectionName && (
            <span className="text-gray-600 dark:text-gray-400 text-sm italic">Section : {selectedSectionName}</span>
          )}
          {selectedDepartement && (
            <button
              onClick={handleClearFilter}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      </div>

      <ListWithFilters
        title="Liste des Auditoires"
        data={auditoires}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'name', header: 'Auditoire' },
          { key: 'level', header: 'Niveau' },
          { key: 'student_count', header: 'Nombre d\'étudiants' },
          { key: 'course_count', header: 'Nombre de cours' },
        ]}
        actions={[
          { label: 'Voir Horaires', onClick: (row) => push({ title: 'Horaires', message: `Voir les horaires de ${row.name}` }) },
        ]}
      />
    </div>
  );
}
