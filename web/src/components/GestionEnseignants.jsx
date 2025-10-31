import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListWithFilters from './ListWithFilters';

export default function GestionEnseignants() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      // Hypothetical API endpoint
      const response = await axios.get('/api/section/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error("Failed to load teachers, using dummy data", error);
      setTeachers([
        { id: 1, name: 'Dr. Ada Lovelace', department: 'Programmation', role: 'Professeur', email: 'ada.l@univ.edu' },
        { id: 2, name: 'Dr. Vint Cerf', department: 'Réseaux', role: 'Professeur', email: 'vint.c@univ.edu' },
        { id: 3, name: 'Dr. Linus Torvalds', department: 'Systèmes', role: 'Professeur', email: 'linus.t@univ.edu' },
        { id: 4, name: 'Mr. John Doe', department: 'Programmation', role: 'Assistant', email: 'john.d@univ.edu' },
        { id: 5, name: 'Ms. Jane Smith', department: 'Réseaux', role: 'Assistante', email: 'jane.s@univ.edu' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-gray-700">Gestion des Enseignants et Assistants</h2>
      <p className="text-gray-600">
        Tenir la liste des enseignants, suivre les performances et participer à la répartition des cours.
      </p>
      <ListWithFilters
        title="Personnel Académique de la Section"
        data={teachers}
        loading={loading}
        onRefresh={loadTeachers}
        columns={[
          { key: 'name', header: 'Nom' },
          { key: 'department', header: 'Département' },
          { key: 'role', header: 'Rôle' },
          { key: 'email', header: 'Email' },
        ]}
        filters={[
          { key: 'name', label: 'Nom', type: 'text' },
          { key: 'department', label: 'Département', type: 'text' },
          { key: 'role', label: 'Rôle', type: 'text' },
        ]}
      />
    </div>
  );
}
