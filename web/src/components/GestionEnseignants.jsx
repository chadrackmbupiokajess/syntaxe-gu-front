import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from './Skeleton';

const TeacherCard = ({ teacher }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center p-6">
    <img className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg" src={`https://i.pravatar.cc/150?u=${teacher.email}`} alt={teacher.name} />
    <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
    <p className="text-md font-semibold text-teal-600">{teacher.role}</p>
    <p className="text-sm text-gray-500 mt-1">{teacher.department}</p>

    <div className="mt-4 flex items-center">
        <span className={`h-3 w-3 rounded-full ${teacher.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="ml-2 text-sm text-gray-600">{teacher.available ? 'Disponible' : 'Non disponible'}</span>
    </div>

    <div className="mt-6 flex-grow flex items-end space-x-2">
        <button className="text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 px-3 py-2 rounded-lg">Message</button>
        <button className="text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg">Profil</button>
        <button className="text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg">Assigner</button>
    </div>
  </div>
);

export default function GestionEnseignants() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', department: '', role: '' });

  const loadTeachers = async () => {
    setLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTeachers([
            { id: 1, name: 'Dr. Ada Lovelace', department: 'Programmation', role: 'Professeur', email: 'ada.l@univ.edu', available: true },
            { id: 2, name: 'Dr. Vint Cerf', department: 'Réseaux', role: 'Professeur', email: 'vint.c@univ.edu', available: false },
            { id: 3, name: 'Dr. Linus Torvalds', department: 'Systèmes', role: 'Professeur', email: 'linus.t@univ.edu', available: true },
            { id: 4, name: 'Mr. John Doe', department: 'Programmation', role: 'Assistant', email: 'john.d@univ.edu', available: true },
            { id: 5, name: 'Ms. Jane Smith', department: 'Réseaux', role: 'Assistante', email: 'jane.s@univ.edu', available: false },
            { id: 6, name: 'Dr. Grace Hopper', department: 'Programmation', role: 'Professeur', email: 'grace.h@univ.edu', available: true },
        ]);
    } catch (error) {
        console.error("Failed to load teachers", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadTeachers(); }, []);

  const filteredTeachers = useMemo(() =>
    teachers.filter(t =>
      t.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.department === '' || t.department === filters.department) &&
      (filters.role === '' || t.role.startsWith(filters.role))
    ), [teachers, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const uniqueDepartments = useMemo(() => [...new Set(teachers.map(t => t.department))], [teachers]);

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Gestion des Enseignants</h2>
            <p className="mt-2 text-lg text-gray-600">Gérez votre personnel académique et suivez leurs activités.</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4">
                <input type="text" name="name" placeholder="Rechercher par nom..." onChange={handleFilterChange} className="border p-2 rounded-md"/>
                <select name="department" onChange={handleFilterChange} className="border p-2 rounded-md">
                    <option value="">Tous les départements</option>
                    {uniqueDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                <select name="role" onChange={handleFilterChange} className="border p-2 rounded-md">
                    <option value="">Tous les rôles</option>
                    <option value="Professeur">Professeurs</option>
                    <option value="Assistant">Assistants</option>
                </select>
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg">
                + Ajouter un Enseignant
            </button>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredTeachers.map(teacher => <TeacherCard key={teacher.id} teacher={teacher} />)}
            </div>
        )}
    </div>
  );
}
