import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListWithFilters from '../components/ListWithFilters';
import Skeleton from '../components/Skeleton';
import { useToast } from '../shared/ToastProvider';

export default function SgaAuditoires() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [auditoires, setAuditoires] = useState([]);

  const fetchAuditoires = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sga/auditoires');
      setAuditoires(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des auditoires.', status: 'error' });
      console.error("Error loading auditoires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditoires();
  }, []);

  const refreshData = () => {
    fetchAuditoires();
    push({ title: 'Données rafraîchies', status: 'success' });
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Auditoires & Horaires</h2>

      <ListWithFilters
        title="Liste des Auditoires"
        data={auditoires}
        loading={loading}
        onRefresh={refreshData}
        columns={[
          { key: 'name', header: 'Nom de l\'auditoire' },
          { key: 'department', header: 'Département' },
          { key: 'section', header: 'Section' },
          { key: 'level', header: 'Niveau' },
          { key: 'student_count', header: 'Nombre d\'étudiants' },
        ]}
        actions={[
          { label: 'Voir Horaires', onClick: (row) => push({ title: 'Horaires', message: `Voir les horaires de ${row.name}` }) },
        ]}
      />
    </div>
  );
}
