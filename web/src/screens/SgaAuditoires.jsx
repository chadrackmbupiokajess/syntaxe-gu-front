import React, { useEffect, useState } from 'react';
import axios from '../api/configAxios';
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAuditorium, setSelectedAuditorium] = useState(null);

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

  const openScheduleModal = (auditorium) => {
    setSelectedAuditorium(auditorium);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedAuditorium(null);
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
          { label: 'Voir Horaires', onClick: openScheduleModal },
        ]}
      />

      {isScheduleModalOpen && selectedAuditorium && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Horaire pour {selectedAuditorium.name}</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Jour</th>
                  <th className="border-b-2 p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Heure de début</th>
                  <th className="border-b-2 p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Heure de fin</th>
                  <th className="border-b-2 p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Cours</th>
                  <th className="border-b-2 p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Enseignant</th>
                </tr>
              </thead>
              <tbody>
                {/* Dummy Data - Replace with API call */}
                <tr>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Lundi</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">08:00</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">10:00</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Introduction à la programmation</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Dr. Ba</td>
                </tr>
                <tr>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Mardi</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">10:00</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">12:00</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Bases de données</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Prof. Diallo</td>
                </tr>
                 <tr>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Mercredi</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">14:00</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">16:00</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Réseaux Informatiques</td>
                  <td className="border-b p-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">M. Sow</td>
                </tr>
              </tbody>
            </table>
            <div className="text-right mt-6">
              <button onClick={closeScheduleModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
