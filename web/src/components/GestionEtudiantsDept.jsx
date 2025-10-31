import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListWithFilters from './ListWithFilters';

export default function GestionEtudiantsDept() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Hypothetical API endpoint
      const response = await axios.get('/api/department/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to load students, using dummy data", error);
      setStudents([
        { id: 1, name: 'Alice Smith', program: 'Licence', year: 2, status: 'Actif' },
        { id: 2, name: 'Bob Johnson', program: 'Licence', year: 3, status: 'Actif' },
        { id: 3, name: 'Charlie Brown', program: 'Master', year: 1, status: 'En pause' },
        { id: 4, name: 'Diana Miller', program: 'Licence', year: 1, status: 'Actif' },
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
      <h2 className="text-2xl font-semibold text-gray-700">Suivi des Étudiants</h2>
      <p className="text-gray-600">
        Gérer les listes d'étudiants inscrits, superviser leur progression académique et contrôler leur participation.
      </p>
      <ListWithFilters
        title="Étudiants du Département"
        data={students}
        loading={loading}
        onRefresh={loadStudents}
        columns={[
          { key: 'name', header: 'Nom' },
          { key: 'program', header: 'Programme' },
          { key: 'year', header: 'Année' },
          { key: 'status', header: 'Statut' },
        ]}
        filters={[
          { key: 'name', label: 'Nom', type: 'text' },
          { key: 'program', label: 'Programme', type: 'text' },
          { key: 'year', label: 'Année', type: 'text' },
          { key: 'status', label: 'Statut', type: 'text' },
        ]}
      />
      {/* Des options pour exporter la liste, ou afficher des statistiques pourraient être ajoutées ici */}
    </div>
  );
}
