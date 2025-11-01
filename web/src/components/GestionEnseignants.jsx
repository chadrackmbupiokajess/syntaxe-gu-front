import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/configAxios'; // Corrected import
import Skeleton from './Skeleton';
import KpiCard from './KpiCard';

// Icons (assuming these are already defined or imported elsewhere, or we can define them here)
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.55 23.55 0 0112 15c-1.635 0-3.201-.19-4.704-.545M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const TeacherCard = ({ teacher, onAssign }) => {
  const isAvailable = teacher.status === 'Activé';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col">
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        <img className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-teal-500 dark:ring-teal-400 shadow-md" src={`https://i.pravatar.cc/150?u=${teacher.email}`} alt={teacher.name} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2 w-full px-2 break-words">{teacher.name}</h3>
        
        {/* Role as a badge */}
        <span className="text-sm font-semibold text-white bg-teal-600 px-3 py-1 rounded-full w-auto break-words mb-3">{teacher.rank || 'Rôle non défini'}</span>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 w-full px-2 break-words">{teacher.department}</p>

        {/* Status as a badge */}
        <div className="mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${isAvailable ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                </svg>
                {isAvailable ? 'Disponible' : 'Non disponible'}
            </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 flex justify-center items-center gap-2 border-t border-gray-100 dark:border-slate-700">
          <button className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-lg shadow-md transition-all duration-300 whitespace-nowrap">Message</button>
          <button className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 rounded-lg shadow-md transition-all duration-300 whitespace-nowrap">Profil</button>
          <button 
              onClick={() => onAssign(teacher)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 px-3 py-2 rounded-lg shadow-md transition-all duration-300 whitespace-nowrap">
              Assigner
          </button>
      </div>
    </div>
  );
};

export default function GestionEnseignants({ currentRole }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', department: '', role: '' });
  const [summary, setSummary] = useState(null); // For department/section summary
  
  // Assign Teacher Modal states
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState(null);
  const [availableAuditoires, setAvailableAuditoires] = useState([]); // New state for auditoires
  const [selectedAuditoireToAssign, setSelectedAuditoireToAssign] = useState(''); // New state for selected auditoire
  const [coursesForSelectedAuditoire, setCoursesForSelectedAuditoire] = useState([]); // New state for courses of selected auditoire
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  const isDepartmentRole = currentRole === 'chef_departement';
  const pageTitle = isDepartmentRole
      ? 'Gestion des Enseignants du Département: Exemple Technique de maintenance'
      : 'Gestion des Enseignants de la Section';
  const pageDescription = isDepartmentRole
      ? 'Gérez et suivez les enseignants de votre département.'
      : 'Gérez et suivez les enseignants de votre section.';

  const loadTeachersAuditoiresAndSummary = async () => {
    setLoading(true);
    try {
        const teachersApiEndpoint = isDepartmentRole ? '/api/department/teachers' : '/api/section/teachers';
        const summaryApiEndpoint = isDepartmentRole ? '/api/department/summary' : '/api/section/summary';
        const auditoiresApiEndpoint = isDepartmentRole ? '/api/department/auditoriums' : '/api/section/auditoriums'; // New API call for auditoires

        const [teachersResponse, summaryResponse, auditoiresResponse] = await Promise.all([
            axios.get(teachersApiEndpoint),
            axios.get(summaryApiEndpoint),
            axios.get(auditoiresApiEndpoint), // Fetch auditoires
        ]);

        setTeachers(teachersResponse.data);
        setSummary(summaryResponse.data);
        setAvailableAuditoires(auditoiresResponse.data); // Set available auditoires
    } catch (error) {
        console.error("Failed to load data for teachers management", error);
        setTeachers([]);
        setSummary(null);
        setAvailableAuditoires([]);
    } finally {
        setLoading(false);
    }
  };

  // Effect to load courses when selected auditoire changes
  useEffect(() => {
    const fetchCoursesForAuditoire = async () => {
      if (selectedAuditoireToAssign) {
        setCoursesForSelectedAuditoire([]); // Clear previous courses
        try {
          const coursesApiEndpoint = isDepartmentRole 
            ? `/api/department/auditoriums/${selectedAuditoireToAssign}/courses` 
            : `/api/section/auditoriums/${selectedAuditoireToAssign}/courses`;
          const response = await axios.get(coursesApiEndpoint);
          setCoursesForSelectedAuditoire(response.data);
        } catch (error) {
          console.error(`Failed to load courses for auditoire ${selectedAuditoireToAssign}`, error);
          setCoursesForSelectedAuditoire([]);
        }
      }
    };
    fetchCoursesForAuditoire();
  }, [selectedAuditoireToAssign, isDepartmentRole]); // Re-run when selectedAuditoireToAssign or role changes

  useEffect(() => { loadTeachersAuditoiresAndSummary(); }, [currentRole]);

  const filteredTeachers = useMemo(() =>
    teachers.filter(t =>
      t.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.department === '' || t.department === filters.department) &&
      (filters.role === '' || (t.rank && t.rank.toLowerCase().startsWith(filters.role.toLowerCase())))
    ), [teachers, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const uniqueDepartments = useMemo(() => [...new Set(teachers.map(t => t.department))], [teachers]);

  const handleAssignClick = (teacher) => {
    setSelectedTeacherForAssignment(teacher);
    setShowAssignTeacherModal(true);
    setSelectedAuditoireToAssign(''); // Reset selected auditoire
    setCoursesForSelectedAuditoire([]); // Clear courses
    setSelectedCourseToAssign(''); // Reset selected course
  };

  const handleCloseAssignTeacherModal = () => {
    setShowAssignTeacherModal(false);
    setSelectedTeacherForAssignment(null);
    setSelectedAuditoireToAssign('');
    setCoursesForSelectedAuditoire([]);
    setSelectedCourseToAssign('');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherForAssignment || !selectedAuditoireToAssign || !selectedCourseToAssign) {
      alert('Veuillez sélectionner un enseignant, un auditoire et un cours.');
      return;
    }

    setAssigning(true);
    try {
      const assignApiEndpoint = isDepartmentRole ? '/api/department/assign-course' : '/api/section/assign-course';
      await axios.post(assignApiEndpoint, {
        teacherId: selectedTeacherForAssignment.id,
        auditoireId: selectedAuditoireToAssign, // Include auditoireId
        courseId: selectedCourseToAssign,
      });
      alert('Cours assigné avec succès!');
      handleCloseAssignTeacherModal();
      loadTeachersAuditoiresAndSummary(); // Reload data to reflect changes
    } catch (error) {
      console.error("Failed to assign course", error);
      alert("Erreur lors de l'assignation du cours.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{pageTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">{pageDescription}</p>
        </div>

        {/* KPI Cards Section */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="Total Enseignants" value={summary?.teachers?.val || 0} color="bg-gradient-to-r from-blue-500 to-blue-600" icon={<UsersIcon />} />
                <KpiCard label="Enseignants Disponibles" value={filteredTeachers.filter(t => t.status === 'Activé').length} color="bg-gradient-to-r from-green-500 to-green-600" icon={<CheckCircleIcon />} />
                <KpiCard label="Professeurs" value={filteredTeachers.filter(t => t.rank && t.rank.toLowerCase().includes('professeur')).length} color="bg-gradient-to-r from-purple-500 to-purple-600" icon={<AcademicCapIcon />} />
                <KpiCard label="Assistants" value={filteredTeachers.filter(t => t.rank && t.rank.toLowerCase().includes('assistant')).length} color="bg-gradient-to-r from-orange-500 to-orange-600" icon={<BriefcaseIcon />} />
            </div>
        )}

        {/* Filters and Actions Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-4">
                <input type="text" name="name" placeholder="Rechercher par nom..." onChange={handleFilterChange} className="border border-gray-300 dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                {!isDepartmentRole && ( // Only show department filter if it's a section role
                    <select name="department" onChange={handleFilterChange} className="border border-gray-300 dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Tous les départements</option>
                        {uniqueDepartments.map(dep => <option key={`dep-${dep}`} value={dep}>{dep}</option>)}
                    </select>
                )}
                <select name="role" onChange={handleFilterChange} className="border border-gray-300 dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Tous les rôles</option>
                    <option value="Professeur">Professeurs</option>
                    <option value="Assistant">Assistants</option>
                </select>
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                + Ajouter un Enseignant
            </button>
        </div>

        {/* Teacher List Section */}
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {filteredTeachers.map(teacher => <TeacherCard key={teacher.id} teacher={teacher} onAssign={handleAssignClick} />)}
            </div>
        )}

        {/* Assign Teacher Modal */}
        {showAssignTeacherModal && selectedTeacherForAssignment && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-1/2 max-w-lg">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Assigner un Cours à {selectedTeacherForAssignment.name}</h3>
                    <form onSubmit={handleAssignSubmit}>
                        <div className="mb-4">
                            <label htmlFor="auditoire-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Sélectionner un Auditoire:</label>
                            <select
                                id="auditoire-select"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700"
                                value={selectedAuditoireToAssign}
                                onChange={(e) => setSelectedAuditoireToAssign(e.target.value)}
                                disabled={assigning}
                                required
                            >
                                <option value="">-- Choisir un auditoire --</option>
                                {availableAuditoires.map(auditoire => (
                                    <option key={auditoire.id} value={auditoire.id}>{auditoire.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="course-select" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Sélectionner un Cours:</label>
                            <select
                                id="course-select"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700"
                                value={selectedCourseToAssign}
                                onChange={(e) => setSelectedCourseToAssign(e.target.value)}
                                disabled={assigning || !selectedAuditoireToAssign} // Disable if no auditoire selected
                                required
                            >
                                <option value="">-- Choisir un cours --</option>
                                {coursesForSelectedAuditoire.map(course => (
                                    <option key={course.id} value={course.id}>{course.intitule} ({course.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={assigning}
                            >
                                {assigning ? 'Assignation en cours...' : 'Assigner'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseAssignTeacherModal}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={assigning}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
