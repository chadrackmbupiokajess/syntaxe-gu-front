import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

// --- Re-styled Course Card Component ---
const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">{course.intitule}</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">{course.semestre}</span>
            </div>
            <p className="text-gray-500 mt-1">Code: {course.code}</p>
            
            <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600"><span className="font-semibold">Enseignant:</span> {course.teacher}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Crédits:</span> {course.credits}</p>
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Voir Détails</button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-800">Modifier</button>
        </div>
    </div>
);

// --- Main Component ---
export default function GestionPedagogiqueDept() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/department/courses');
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to load department courses, using dummy data", error);
      setCourses([
        { code: 'PROG101', intitule: 'Introduction à la Programmation', semestre: 'S1', credits: 5, teacher: 'Dr. Ada Lovelace' },
        { code: 'PROG201', intitule: 'Structures de Données', semestre: 'S2', credits: 6, teacher: 'Dr. Alan Turing' },
        { code: 'PROG301', intitule: 'Algorithmique Avancée', semestre: 'S1', credits: 5, teacher: 'Dr. Grace Hopper' },
        { code: 'PROG401', intitule: 'Développement Web', semestre: 'S2', credits: 7, teacher: 'Dr. Tim Berners-Lee' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Memoized stats for performance
  const stats = useMemo(() => {
      const totalCourses = courses.length;
      const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
      return { totalCourses, totalCredits };
  }, [courses]);

  return (
    <div className="grid gap-8">
        {/* Header and Stats */}
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Gestion Pédagogique</h2>
            <p className="text-gray-600 mt-1">
                Supervisez le programme des cours, les crédits et les enseignants responsables.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Nombre de cours</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.totalCourses}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total des crédits</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.totalCredits}</p>
                </div>
            </div>
        </div>

        {/* Course Cards */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <CourseCard key={course.code} course={course} />
                ))}
            </div>
        )}
    </div>
  );
}
