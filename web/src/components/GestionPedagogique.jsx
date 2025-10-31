import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListWithFilters from './ListWithFilters';
import Skeleton from './Skeleton';

export default function GestionPedagogique() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // NOTE: This is a hypothetical API endpoint. 
      // In a real application, you would fetch this data from your backend.
      const response = await axios.get('/api/section/courses');
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to load courses, using dummy data", error);
      setCourses([
        { code: 'INFO101', intitule: 'Introduction à la programmation', departement: 'Programmation', credits: 5, semestre: 'S1' },
        { code: 'NETW201', intitule: 'Réseaux informatiques', departement: 'Réseaux', credits: 4, semestre: 'S2' },
        { code: 'SYST301', intitule: 'Systèmes d\'exploitation', departement: 'Systèmes', credits: 4, semestre: 'S1' },
        { code: 'DBAS401', intitule: 'Bases de données avancées', departement: 'Programmation', credits: 4, semestre: 'S2' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-gray-700">Programme des Cours</h2>
      <p className="text-gray-600">
        Élaborer, organiser et superviser le programme de cours de la section.
      </p>
      <ListWithFilters
        title="Cours de la section"
        data={courses}
        loading={loading}
        onRefresh={loadCourses}
        columns={[
          { key: 'code', header: 'Code Cours' },
          { key: 'intitule', header: 'Intitulé' },
          { key: 'departement', header: 'Département' },
          { key: 'semestre', header: 'Semestre' },
          { key: 'credits', header: 'Crédits' },
        ]}
        filters={[
          { key: 'intitule', label: 'Intitulé', type: 'text' },
          { key: 'departement', label: 'Département', type: 'text' },
          { key: 'semestre', label: 'Semestre', type: 'text' },
        ]}
      />
      {/* D'autres fonctionnalités de gestion pédagogique (ex: validation des horaires) pourront être ajoutées ici */}
    </div>
  );
}
