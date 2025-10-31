import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

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
                <p className="text-sm text-gray-600"><span className="font-semibold">Auditoire:</span> {course.auditoire_name}</p>
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Voir Détails</button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-800">Modifier</button>
        </div>
    </div>
);

// --- Create Course Modal Component ---
const CreateCourseModal = ({ isOpen, onClose, onCreateCourse, teachers, auditoires }) => {
  const [newCourse, setNewCourse] = useState({
    intitule: '', semestre: '', credits: '', teacher: '', auditoire_id: ''
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCourse(newCourse);
    setNewCourse({ intitule: '', semestre: '', credits: '', teacher: '', auditoire_id: '' }); // Reset form
    setGeneratedCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Créer un nouveau cours</h3>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="text"
            name="code"
            value={generatedCode}
            readOnly
            placeholder="Code du cours (généré automatiquement)"
            className="p-2 border rounded-md bg-gray-100"
          />
          <input type="text" name="intitule" value={newCourse.intitule} onChange={handleChange} placeholder="Intitulé du cours" className="p-2 border rounded-md" required />
          <select name="semestre" value={newCourse.semestre} onChange={handleChange} className="w-full p-2 border rounded-md" required>
            <option value="" disabled>Sélectionnez un semestre</option>
            <option value="mi-session">Mi-session</option>
            <option value="session">Session</option>
          </select>
          <input type="number" name="credits" value={newCourse.credits} onChange={handleChange} placeholder="Crédits" className="p-2 border rounded-md" required />
          <select name="teacher" value={newCourse.teacher} onChange={handleChange} className="w-full p-2 border rounded-md" required>
            <option value="" disabled>Sélectionnez un enseignant</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select name="auditoire_id" value={newCourse.auditoire_id} onChange={handleChange} className="w-full p-2 border rounded-md" required>
            <option value="" disabled>Sélectionnez un auditoire</option>
            {auditoires.map(aud => (
              <option key={aud.id} value={aud.id}>{aud.name}</option>
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
  const [teachersList, setTeachersList] = useState([]);
  const [auditoires, setAuditoires] = useState([]);
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [selectedAuditoireId, setSelectedAuditoireId] = useState('');
  const [generatedCode, setGeneratedCode] = React.useState('');

  const loadCourses = async (sessionType = selectedSessionType, auditoireId = selectedAuditoireId) => {
    setLoading(true);
    try {
      const params = {};
      if (sessionType) params.session_type = sessionType;
      if (auditoireId) params.auditoire_id = auditoireId;

      const response = await axios.get('/api/department/courses', { params });
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to load department courses", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachersAndAuditoires = async () => {
    try {
      const [teachersRes, auditoiresRes] = await Promise.all([
        axios.get('/api/department/teachers'),
        axios.get('/api/department/auditoriums'),
      ]);
      setTeachersList(teachersRes.data);
      setAuditoires(auditoiresRes.data);
    } catch (error) {
      console.error("Failed to load teachers or auditoriums", error);
      setTeachersList([]);
      setAuditoires([]);
    }
  };

  useEffect(() => {
    loadTeachersAndAuditoires();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [selectedSessionType, selectedAuditoireId]); // Reload courses when filters change

  const generateCode = () => {
    const randomHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += randomHex();
    }
    setGeneratedCode(code.toUpperCase());
    return code.toUpperCase();
  };

  const handleCreateCourse = async (newCourseData) => {
    try {
      await axios.post('/api/department/courses/create', {
        intitule: newCourseData.intitule,
        semestre: newCourseData.semestre,
        credits: parseInt(newCourseData.credits),
        teacher: newCourseData.teacher,
        auditoire_id: newCourseData.auditoire_id,
      });
      alert(`Cours '${newCourseData.intitule}' créé avec succès.`);
      setIsModalOpen(false);
      loadCourses(); // Reload courses after creation
    } catch (error) {
      console.error("Failed to create course", error);
      alert("Erreur lors de la création du cours.");
    }
  };

  const handleOpenModal = () => {
    generateCode();
    setIsModalOpen(true);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Gestion Pédagogique</h2>
                <p className="text-gray-600 mt-1">
                    Supervisez le programme des cours, les crédits et les enseignants responsables.
                </p>
            </div>
            <button
                onClick={handleOpenModal}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
            >
                Ajouter un nouveau cours
            </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
            <select
                value={selectedSessionType}
                onChange={(e) => setSelectedSessionType(e.target.value)}
                className="p-2 border rounded-md shadow-sm"
            >
                <option value="">Toutes les sessions</option>
                <option value="mi-session">Mi-session</option>
                <option value="session">Session</option>
            </select>
            <select
                value={selectedAuditoireId}
                onChange={(e) => setSelectedAuditoireId(e.target.value)}
                className="p-2 border rounded-md shadow-sm"
            >
                <option value="">Tous les auditoires</option>
                {auditoires.map(aud => (
                    <option key={aud.id} value={aud.id}>{aud.name}</option>
                ))}
            </select>
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
                {courses.length > 0 ? (
                    courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))
                ) : (
                    <p className="text-gray-600 col-span-full text-center">Aucun cours trouvé avec les filtres actuels.</p>
                )}
            </div>
        )}

        <CreateCourseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreateCourse={handleCreateCourse}
            teachers={teachersList}
            auditoires={auditoires}
        />
    </div>
  );
}
