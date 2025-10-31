import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

// Dummy data for available teachers for course assignment
const dummyTeachersList = [
  { id: 'T1', name: 'Dr. Ada Lovelace' },
  { id: 'T2', name: 'Dr. Alan Turing' },
  { id: 'T3', name: 'Dr. Grace Hopper' },
  { id: 'T4', name: 'Dr. Tim Berners-Lee' },
];

// --- Course Card Component ---
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

// --- Create Course Modal Component ---
const CreateCourseModal = ({ isOpen, onClose, onCreateCourse, teachers }) => {
  const [newCourse, setNewCourse] = useState({
    code: '', intitule: '', semestre: '', credits: '', teacher: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCourse(newCourse);
    setNewCourse({ code: '', intitule: '', semestre: '', credits: '', teacher: '' }); // Reset form
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Créer un nouveau cours</h3>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input type="text" name="code" value={newCourse.code} onChange={handleChange} placeholder="Code du cours" className="p-2 border rounded-md" required />
          <input type="text" name="intitule" value={newCourse.intitule} onChange={handleChange} placeholder="Intitulé du cours" className="p-2 border rounded-md" required />
          <select name="semestre" value={newCourse.semestre} onChange={handleChange} className="p-2 border rounded-md" required>
            <option value="" disabled>Sélectionnez un semestre</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
          <input type="number" name="credits" value={newCourse.credits} onChange={handleChange} placeholder="Crédits" className="p-2 border rounded-md" required />
          <select name="teacher" value={newCourse.teacher} onChange={handleChange} className="p-2 border rounded-md" required>
            <option value="" disabled>Sélectionnez un enseignant</option>
            {teachers.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800">Annuler</button>
            <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">Créer le cours</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function GestionPedagogiqueDept() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateCourse = (newCourse) => {
    // In a real app, you would make an API call to create the course
    console.log("Nouveau cours créé (simulation):", newCourse);
    alert(`Cours '${newCourse.intitule}' créé (simulation).`);
    setCourses(prevCourses => [...prevCourses, { ...newCourse, id: Date.now() }]); // Add with a unique ID
    setIsModalOpen(false);
  };

  // Memoized stats for performance
  const stats = useMemo(() => {
      const totalCourses = courses.length;
      const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
      return { totalCourses, totalCredits };
  }, [courses]);

  return (
    <div className="grid gap-8">
        {/* Header and Stats */}
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Gestion Pédagogique</h2>
                <p className="text-gray-600 mt-1">
                    Supervisez le programme des cours, les crédits et les enseignants responsables.
                </p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
            >
                Ajouter un nouveau cours
            </button>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-500">
                <p className="text-sm font-medium text-gray-500">Nombre de cours</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.totalCourses}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-green-500">
                <p className="text-sm font-medium text-gray-500">Total des crédits</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.totalCredits}</p>
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

        <CreateCourseModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onCreateCourse={handleCreateCourse}
            teachers={dummyTeachersList} // Pass dummy teachers for selection
        />
    </div>
  );
}
