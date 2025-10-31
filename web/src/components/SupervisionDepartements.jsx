import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListWithFilters from './ListWithFilters';

export default function SupervisionDepartements() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      // Hypothetical API endpoint
      const response = await axios.get('/api/section/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error("Failed to load departments, using dummy data", error);
      setDepartments([
        { id: 1, name: 'Programmation', head: 'Dr. Ada Lovelace', teachers: 12, students: 150 },
        { id: 2, name: 'Réseaux', head: 'Dr. Vint Cerf', teachers: 8, students: 110 },
        { id: 3, name: 'Systèmes', head: 'Dr. Linus Torvalds', teachers: 7, students: 95 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-gray-700">Supervision des Départements</h2>
      <p className="text-gray-600">
        Superviser et coordonner les Chefs de Département, suivre la répartition des cours et valider les rapports d’activités.
      </p>
      <ListWithFilters
        title="Départements de la section"
        data={departments}
        loading={loading}
        onRefresh={loadDepartments}
        columns={[
          { key: 'name', header: 'Nom du Département' },
          { key: 'head', header: 'Chef de Département' },
          { key: 'teachers', header: 'Nb. Enseignants' },
          { key: 'students', header: 'Nb. Étudiants' },
        ]}
        filters={[
          { key: 'name', label: 'Nom', type: 'text' },
          { key: 'head', label: 'Chef', type: 'text' },
        ]}
      />
       {/* Un espace pour les rapports d'activités pourrait être ajouté ici */}
    </div>
  );
}
