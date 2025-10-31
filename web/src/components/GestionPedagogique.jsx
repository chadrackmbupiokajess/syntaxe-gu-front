import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import KpiCard from './KpiCard';
import Skeleton from './Skeleton';

// Dummy Icon Components (replace with a real icon library like react-icons)
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.518a3.75 3.75 0 013.483 3.483H14.75a.75.75 0 010 1.5h-.518a3.75 3.75 0 01-3.483 3.483v.518a.75.75 0 01-1.5 0v-.518A3.75 3.75 0 015.768 8.25H5.25a.75.75 0 010-1.5h.518A3.75 3.75 0 019.25 3.268V2.75A.75.75 0 0110 2zM8.25 5.768A2.25 2.25 0 0110 3.518v5.964a2.25 2.25 0 01-1.75-2.25V5.768z" clipRule="evenodd" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9.25 12.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10.75 6.5a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.intitule}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{course.code}</span>
      </div>
      <div className="text-gray-600 space-y-3 mt-4">
        <div className="flex items-center"><TagIcon /><span className="ml-2">Département: <span className="font-medium text-gray-700">{course.departement}</span></span></div>
        <div className="flex items-center"><BookIcon /><span className="ml-2">Crédits: <span className="font-medium text-gray-700">{course.credits}</span></span></div>
        <div className="flex items-center"><CalendarIcon /><span className="ml-2">Semestre: <span className="font-medium text-gray-700">{course.semestre}</span></span></div>
      </div>
    </div>
    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
        <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Voir les détails</button>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Modifier</button>
    </div>
  </div>
);

export default function GestionPedagogique() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ intitule: '', departement: '', semestre: '' });

  const loadCourses = async () => {
    setLoading(true);
    try {
        const response = await axios.get('/api/section/courses');
        setCourses(response.data);
    } catch (error) {
        console.error("Failed to load courses", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const filteredCourses = useMemo(() => 
    courses.filter(c => 
      c.intitule.toLowerCase().includes(filters.intitule.toLowerCase()) &&
      c.departement.toLowerCase().includes(filters.departement.toLowerCase()) &&
      c.semestre.toLowerCase().includes(filters.semestre.toLowerCase())
    ), [courses, filters]);

  const totalCredits = useMemo(() => filteredCourses.reduce((sum, c) => sum + c.credits, 0), [filteredCourses]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Gestion Pédagogique</h2>
        <p className="mt-2 text-lg text-gray-600">Organisez et supervisez le programme de cours de votre section.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Nombre Total de Cours" value={loading ? '...' : filteredCourses.length} color="bg-blue-600" />
        <KpiCard label="Total Crédits de la Sélection" value={loading ? '...' : totalCredits} color="bg-green-600" />
        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                Valider les Emplois du Temps
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
                <input type="text" name="intitule" placeholder="Filtrer par intitulé..." onChange={handleFilterChange} className="border p-2 rounded"/>
                <input type="text" name="departement" placeholder="Filtrer par département..." onChange={handleFilterChange} className="border p-2 rounded"/>
                <input type="text" name="semestre" placeholder="Filtrer par semestre..." onChange={handleFilterChange} className="border p-2 rounded"/>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                + Proposer un Nouveau Cours
            </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => <CourseCard key={course.code} course={course} />)}
        </div>
      )}
    </div>
  );
}
