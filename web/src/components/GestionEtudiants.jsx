import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListWithFilters from './ListWithFilters';

export default function GestionEtudiants() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Hypothetical API endpoint
      const response = await axios.get('/api/section/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to load students, using dummy data", error);
      setStudents([
        { id: 1, name: 'Alice Martin', matricule: '18A001', promotion: 'G1', department: 'Programmation' },
        { id: 2, name: 'Bob Durand', matricule: '18A002', promotion: 'G2', department: 'Réseaux' },
        { id: 3, name: 'Charlie Dupont', matricule: '17B003', promotion: 'L1', department: 'Systèmes' },
        { id: 4, name: 'David Bernard', matricule: '19C004', promotion: 'G1', department: 'Programmation' },
        { id: 5, name: 'Eve Petit', matricule: '16D005', promotion: 'L2', department: 'Réseaux' },
        { id: 6, name: 'Frank Moreau', matricule: '18E006', promotion: 'G2', department: 'Programmation' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-gray-700">Gestion des Étudiants</h2>
      <p className="text-gray-600">
        Accéder à la liste complète des étudiants de la section et connaître leur répartition par promotion.
      </p>
      <ListWithFilters
        title="Étudiants de la Section"
        data={students}
        loading={loading}
        onRefresh={loadStudents}
        columns={[
          { key: 'name', header: 'Nom Complet' },
          { key: 'matricule', header: 'Matricule' },
          { key: 'promotion', header: 'Promotion' },
          { key: 'department', header: 'Département' },
        ]}
        filters={[
          { key: 'name', label: 'Nom', type: 'text' },
          { key: 'matricule', label: 'Matricule', type: 'text' },
          { key: 'promotion', label: 'Promotion', type: 'text' },
          { key: 'department', label: 'Département', type: 'text' },
        ]}
      />
    </div>
  );
}
