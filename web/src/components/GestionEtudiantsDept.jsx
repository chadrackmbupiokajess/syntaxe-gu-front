import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

// --- Re-styled Student Card Component (Plain) ---
const StudentCard = ({ student }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
            <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {/* Placeholder for a photo */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                    <p className="text-gray-600">{student.program} - Année {student.year}</p>
                </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600"><span className="font-semibold">Statut:</span> 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {student.status}
                    </span>
                </p>
                {/* Add more student details here if needed */}
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Voir le dossier</button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-800">Contacter</button>
        </div>
    </div>
);

// --- Main Component ---
export default function GestionEtudiantsDept() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
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

  const stats = useMemo(() => {
      const total = students.length;
      const active = students.filter(s => s.status === 'Actif').length;
      const paused = total - active;
      return { total, active, paused };
  }, [students]);

  return (
    <div className="grid gap-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Gestion des Étudiants</h2>
            <p className="text-gray-600 mt-1">Suivez la progression et le statut des étudiants de votre département.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-500">Total Étudiants</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-green-500">
                    <p className="text-sm font-medium text-gray-500">Actifs</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.active}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-yellow-500">
                    <p className="text-sm font-medium text-gray-500">En Pause</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.paused}</p>
                </div>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-60" /><Skeleton className="h-60" /><Skeleton className="h-60" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </div>
        )}
    </div>
  );
}
