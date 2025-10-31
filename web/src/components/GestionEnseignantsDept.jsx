import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

// SVG Search Icon
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// --- Teacher Card Component (Plain) ---
const TeacherCard = ({ teacher, onAssignClick }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
            <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
                    <p className="text-gray-600">{teacher.rank}</p>
                </div>
            </div>

            <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600"><span className="font-semibold">Statut:</span>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {teacher.status}
                    </span>
                </p>
                <p className="text-sm text-gray-600 mt-2"><span className="font-semibold">Cours:</span> {teacher.courses || 'Aucun'}</p>
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button onClick={() => onAssignClick(teacher)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Assigner un cours</button>
        </div>
    </div>
);

// --- Modal Component ---
const AssignCourseModal = ({ teacher, auditoiresWithCourses, onClose, onAssign }) => {
    const [selectedAuditoire, setSelectedAuditoire] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
        // Reset selected course when auditoire changes
        setSelectedCourse('');
    }, [selectedAuditoire]);

    if (!teacher) return null;

    const coursesForSelectedAuditoire = selectedAuditoire
        ? auditoiresWithCourses.find(aud => aud.id === parseInt(selectedAuditoire))?.courses || [] // Parse to int
        : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Assigner un cours à {teacher.name}</h3>
                
                <div className="mb-4">
                    <label htmlFor="auditoire-select" className="block text-sm font-medium text-gray-700 mb-1">Sélectionnez un auditoire</label>
                    <select
                        id="auditoire-select"
                        value={selectedAuditoire}
                        onChange={(e) => setSelectedAuditoire(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="" disabled>Sélectionnez un auditoire</option>
                        {auditoiresWithCourses.map(aud => (
                            <option key={aud.id} value={aud.id}>{aud.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">Sélectionnez un cours</label>
                    <select
                        id="course-select"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={!selectedAuditoire}
                    >
                        <option value="" disabled>Sélectionnez un cours</option>
                        {coursesForSelectedAuditoire.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800">Annuler</button>
                    <button
                        type="button"
                        onClick={() => onAssign(teacher.id, selectedAuditoire, selectedCourse)}
                        disabled={!selectedCourse || !selectedAuditoire}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        Assigner
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function GestionEnseignantsDept() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [auditoiresWithCourses, setAuditoiresWithCourses] = useState([]); // New state for auditoires and their courses
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  const loadData = async () => {
    setLoading(true);
    try {
      const teachersResponse = await axios.get('/api/department/teachers');
      setTeachers(teachersResponse.data);
      
      // Fetch real data for auditoires with courses
      const auditoiresResponse = await axios.get('/api/department/auditoires-with-courses');
      setAuditoiresWithCourses(auditoiresResponse.data);

    } catch (error) {
      console.error("Failed to load data", error);
      setTeachers([]); // Set to empty array on error
      setAuditoiresWithCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (teacher) => {
    // Assuming 'Assistant' is the rank for assistants
    if (teacher.rank !== 'Assistant') {
      alert('Seuls les assistants peuvent se voir attribuer des cours.');
      return;
    }
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleAssignCourse = async (teacherId, auditoireId, courseId) => {
    try {
      await axios.post('/api/department/assign-course', {
        teacherId: parseInt(teacherId), // Convert to integer
        auditoireId: parseInt(auditoireId), // Convert to integer
        courseId: parseInt(courseId), // Convert to integer
      });
      alert(`Cours ${courseId} de l'auditoire ${auditoireId} assigné à ${teacherId} avec succès.`);
      loadData(); // Reload data to reflect the changes
    } catch (error) {
      console.error("Failed to assign course", error);
      alert("Échec de l'affectation du cours.");
    } finally {
      handleCloseModal();
    }
  };

  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return teachers;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      teacher.rank.toLowerCase().includes(lowerCaseSearchTerm) ||
      (teacher.courses && teacher.courses.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [teachers, searchTerm]);

  const stats = useMemo(() => {
      const total = teachers.length;
      const active = teachers.filter(t => t.status === 'Actif').length;
      const onLeave = total - active;
      return { total, active, onLeave };
  }, [teachers]);

  return (
    <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Gestion des Enseignants</h2>
                <p className="text-gray-600 mt-1">Gérez les enseignants, leur statut et l'attribution des cours.</p>
            </div>
            <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0 max-w-xs">
                <input
                    type="text"
                    placeholder="Rechercher un enseignant..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-500">
                <p className="text-sm font-medium text-gray-500">Total Enseignants</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-green-500">
                <p className="text-sm font-medium text-gray-500">Actifs</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.active}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-yellow-500">
                <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.onLeave}</p>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-60" /><Skeleton className="h-60" /><Skeleton className="h-60" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {filteredTeachers.length > 0 ? (
                    filteredTeachers.map(teacher => (
                        <TeacherCard key={teacher.id} teacher={teacher} onAssignClick={handleOpenModal} />
                    ))
                ) : (
                    <p className="text-gray-600 col-span-full text-center">Aucun enseignant trouvé.</p>
                )}
            </div>
        )}

        {isModalOpen && (
            <AssignCourseModal teacher={selectedTeacher} auditoiresWithCourses={auditoiresWithCourses} onClose={handleCloseModal} onAssign={handleAssignCourse} />
        )}
    </div>
  );
}
