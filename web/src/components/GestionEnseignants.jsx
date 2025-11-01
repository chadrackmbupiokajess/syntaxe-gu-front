import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

const TeacherCard = ({ teacher }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center p-6">
    <img className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg" src={`https://i.pravatar.cc/150?u=${teacher.email}`} alt={teacher.name} />
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{teacher.name}</h3>
    <p className="text-md font-semibold text-teal-600 dark:text-teal-400">{teacher.role}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{teacher.department}</p>

    <div className="mt-4 flex items-center">
        <span className={`h-3 w-3 rounded-full ${teacher.available ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{teacher.available ? 'Disponible' : 'Non disponible'}</span>
    </div>

    <div className="mt-6 flex-grow flex items-end space-x-2">
        <button className="text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 px-3 py-2 rounded-lg">Message</button>
        <button className="text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 rounded-lg">Profil</button>
        <button className="text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 rounded-lg">Assigner</button>
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
        const response = await axios.get('/api/section/teachers');
        setTeachers(response.data);
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
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Enseignants</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Gérez votre personnel académique et suivez leurs activités.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4">
                <input type="text" name="name" placeholder="Rechercher par nom..." onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white"/>
                <select name="department" onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white">
                    <option value="">Tous les départements</option>
                    {uniqueDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                <select name="role" onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white">
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
