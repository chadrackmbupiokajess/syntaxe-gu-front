import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

// Dummy Icon Components
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-3 4a4 4 0 100 8 4 4 0 000-8zm6-1a1 1 0 100 2h4a1 1 0 100-2h-4zm-6 4a1 1 0 100 2h4a1 1 0 100-2h-4z" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.5 9a.5.5 0 000 1h3a.5.5 0 000-1h-3zM6 11.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zM2 7a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm3 0a1 1 0 00-1 1v1a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg>;

const DepartmentCard = ({ department }) => {
  const studentTeacherRatio = department.students > 0 ? department.students / department.teachers : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img className="w-16 h-16 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${department.head}`} alt={department.head} />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{department.name}</h3>
            <p className="text-md font-semibold text-indigo-600">Chef: {department.head}</p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
            <div className="flex items-center text-gray-700">
                <UsersIcon />
                <span className="ml-3">{department.teachers} Enseignants</span>
            </div>
            <div className="flex items-center text-gray-700">
                <AcademicCapIcon />
                <span className="ml-3">{department.students} Étudiants</span>
            </div>
        </div>

        <div className="mt-4">
            <p className="text-sm text-gray-500">Ratio Étudiants/Enseignant: <span className="font-bold">{studentTeacherRatio.toFixed(1)}</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${100 / (studentTeacherRatio / 5 + 1)}%` }}></div>
            </div>
        </div>

      </div>
      <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
        <button className="text-sm font-medium text-gray-600 hover:text-indigo-600">Contacter</button>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-100 px-3 py-1 rounded-lg">Gérer</button>
      </div>
    </div>
  );
};

export default function SupervisionDepartements() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDepartments = async () => {
    setLoading(true);
    try {
        const response = await axios.get('/api/section/departments');
        setDepartments(response.data);
    } catch (error) {
        console.error("Failed to load departments", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadDepartments(); }, []);

  const filteredDepartments = useMemo(() =>
    departments.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.head.toLowerCase().includes(searchTerm.toLowerCase())
    ), [departments, searchTerm]);

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Supervision des Départements</h2>
            <p className="mt-2 text-lg text-gray-600">Coordonnez vos chefs de département et suivez leurs activités.</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
            <input 
                type="text" 
                placeholder="Rechercher un département ou un chef..." 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-1/3"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                Consulter les Rapports d'Activités
            </button>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDepartments.map(dept => <DepartmentCard key={dept.id} department={dept} />)}
            </div>
        )}
    </div>
  );
}
