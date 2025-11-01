import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/configAxios'; // Corrected import
import KpiCard from './KpiCard';
import Skeleton from './Skeleton';

// Dummy Icon Components (replace with a real icon library like react-icons)
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.518a3.75 3.75 0 013.483 3.483H14.75a.75.75 0 010 1.5h-.518a3.75 3.75 0 01-3.483 3.483v.518a.75.75 0 01-1.5 0v-.518A3.75 3.75 0 015.768 8.25H5.25a.75.75 0 010-1.5h.518A3.75 3.75 0 019.25 3.268V2.75A.75.75 0 0110 2zM8.25 5.768A2.25 2.25 0 0110 3.518v5.964a2.25 2.25 0 01-1.75-2.25V5.768z" clipRule="evenodd" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9.25 12.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10.75 6.5a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5c1.706 0 3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253" /></svg>;


const CourseCard = ({ course }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{course.intitule}</h3>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">{course.code}</span>
      </div>
      <div className="text-gray-600 dark:text-gray-300 space-y-3 mt-4">
        <div className="flex items-center"><TagIcon /><span className="ml-2">Département: <span className="font-medium text-gray-700 dark:text-gray-200">{course.departement}</span></span></div>
        <div className="flex items-center"><BookIcon /><span className="ml-2">Crédits: <span className="font-medium text-gray-700 dark:text-gray-200">{course.credits}</span></span></div>
        <div className="flex items-center"><CalendarIcon /><span className="ml-2">Semestre: <span className="font-medium text-gray-700 dark:text-gray-200">{course.semestre}</span></span></div>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 flex justify-end gap-3">
        <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Voir les détails</button>
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Modifier</button>
    </div>
  </div>
);

export default function GestionPedagogique({ currentRole }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ intitule: '', departement: '', semestre: '', auditoire: '' });
  const [summary, setSummary] = useState(null);

  // Create Course Modal states
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseIntitule, setNewCourseIntitule] = useState('');
  const [newCourseSemestre, setNewCourseSemestre] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('');
  const [newCourseAuditoire, setNewCourseAuditoire] = useState('');
  const [availableAuditoires, setAvailableAuditoires] = useState([]);
  const [creatingCourse, setCreatingCourse] = useState(false);

  const isDepartmentRole = currentRole === 'chef_departement';

  const loadData = async () => {
    setLoading(true);
    try {
        const coursesApiEndpoint = isDepartmentRole ? '/api/department/courses' : '/api/section/courses';
        const summaryApiEndpoint = isDepartmentRole ? '/api/department/summary' : '/api/section/summary';
        const auditoiresApiEndpoint = isDepartmentRole ? '/api/department/auditoriums' : '/api/section/auditoriums';

        const [coursesResponse, summaryResponse, auditoiresResponse] = await Promise.all([
            axios.get(coursesApiEndpoint),
            axios.get(summaryApiEndpoint),
            axios.get(auditoiresApiEndpoint),
        ]);

        setCourses(coursesResponse.data);
        setSummary(summaryResponse.data);
        setAvailableAuditoires(auditoiresResponse.data);
    } catch (error) {
        console.error("Failed to load data", error);
        setCourses([]);
        setSummary(null);
        setAvailableAuditoires([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentRole]);

  const filteredCourses = useMemo(() => 
    courses.filter(c => 
      c.intitule.toLowerCase().includes(filters.intitule.toLowerCase()) &&
      (isDepartmentRole || c.departement.toLowerCase().includes(filters.departement.toLowerCase())) &&
      (!filters.semestre || (c.semestre && c.semestre.trim().toLowerCase() === filters.semestre.trim().toLowerCase())) &&
      (!filters.auditoire || c.auditoire_id === parseInt(filters.auditoire))
    ), [courses, filters, isDepartmentRole]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Create Course Modal handlers
  const handleProposeNewCourse = () => {
    setShowCreateCourseModal(true);
    setNewCourseIntitule('');
    setNewCourseSemestre('');
    setNewCourseCredits('');
    setNewCourseAuditoire('');
  };

  const handleCloseCreateCourseModal = () => {
    setShowCreateCourseModal(false);
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    if (!newCourseIntitule || !newCourseSemestre || !newCourseCredits || !newCourseAuditoire) {
      alert('Veuillez remplir tous les champs pour créer un cours.');
      return;
    }

    setCreatingCourse(true);
    try {
      const createCourseApiEndpoint = isDepartmentRole ? '/api/department/course-create' : '/api/section/course-create';
      await axios.post(createCourseApiEndpoint, {
        intitule: newCourseIntitule,
        semestre: newCourseSemestre,
        credits: parseInt(newCourseCredits),
        auditoire_id: newCourseAuditoire,
      });
      alert('Cours créé avec succès!');
      handleCloseCreateCourseModal();
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error("Failed to create course", error);
      alert("Erreur lors de la création du cours.");
    } finally {
      setCreatingCourse(false);
    }
  }; 

  const pageTitle = isDepartmentRole ? 'Gestion Pédagogique du Département' : 'Gestion Pédagogique de la Section';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Organisez et supervisez le programme de cours de votre {isDepartmentRole ? 'département' : 'section'}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
        <KpiCard label="Nombre Total de Cours" value={loading ? '...' : (summary?.courses || 0)} color="bg-blue-600" icon={<BookOpenIcon />} />
        <KpiCard label="Total Crédits" value={loading ? '...' : (summary?.total_credits || 0)} color="bg-green-600" icon={<BookIcon />} />
        <KpiCard label="Nombre Total d'Enseignants" value={loading ? '...' : (summary?.teachers?.val || 0)} color="bg-purple-600" icon={<AcademicCapIcon />} />
        <KpiCard label="Nombre Total d'Étudiants" value={loading ? '...' : (summary?.students?.val || 0)} color="bg-red-600" icon={<UsersIcon />} />
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
                <input type="text" name="intitule" placeholder="Filtrer par intitulé..." onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded dark:bg-slate-700 dark:text-white"/>
                {!isDepartmentRole && (
                  <input type="text" name="departement" placeholder="Filtrer par département..." onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded dark:bg-slate-700 dark:text-white"/>
                )}
                <select name="semestre" onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white">
                    <option value="">Toutes les sessions</option>
                    <option value="Mi-session">Mi-session</option>
                    <option value="Session">Session</option>
                </select>
                <select name="auditoire" onChange={handleFilterChange} className="border dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white">
                    <option value="">Tous les auditoires</option>
                    {availableAuditoires.map(auditoire => (
                        <option key={auditoire.id} value={auditoire.id}>{auditoire.name}</option>
                    ))}
                </select>
            </div>
            <button onClick={handleProposeNewCourse} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                + Ajouter un cours
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

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-1/2 max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Proposer un Nouveau Cours</h3>
            <form onSubmit={handleCreateCourseSubmit}>
              <div className="mb-4">
                <label htmlFor="new-course-intitule" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Intitulé du Cours:</label>
                <input
                  type="text"
                  id="new-course-intitule"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700"
                  value={newCourseIntitule}
                  onChange={(e) => setNewCourseIntitule(e.target.value)}
                  disabled={creatingCourse}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="new-course-semestre" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Semestre:</label>
                <select
                  id="new-course-semestre"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700"
                  value={newCourseSemestre}
                  onChange={(e) => setNewCourseSemestre(e.target.value)}
                  disabled={creatingCourse}
                  required
                >
                  <option value="">-- Choisir un semestre --</option>
                  <option value="Mi-session">Mi-session</option>
                  <option value="Session">Session</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="new-course-credits" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Crédits:</label>
                <input
                  type="number"
                  id="new-course-credits"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700"
                  value={newCourseCredits}
                  onChange={(e) => setNewCourseCredits(e.target.value)}
                  disabled={creatingCourse}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="new-course-auditoire" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Auditoire:</label>
                <select
                  id="new-course-auditoire"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-slate-700"
                  value={newCourseAuditoire}
                  onChange={(e) => setNewCourseAuditoire(e.target.value)}
                  disabled={creatingCourse}
                  required
                >
                  <option value="">-- Choisir un auditoire --</option>
                  {availableAuditoires.map(auditoire => (
                    <option key={auditoire.id} value={auditoire.id}>{auditoire.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={creatingCourse}
                >
                  {creatingCourse ? 'Création en cours...' : 'Créer le Cours'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseCreateCourseModal}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={creatingCourse}
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
