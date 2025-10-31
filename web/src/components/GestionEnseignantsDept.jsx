import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';

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
const AssignCourseModal = ({ teacher, courses, onClose, onAssign }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    if (!teacher) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Assigner un cours à {teacher.name}</h3>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full p-2 border rounded-md mb-4">
                    <option value="" disabled>Sélectionnez un cours</option>
                    {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">Annuler</button>
                    <button onClick={() => onAssign(teacher.id, selectedCourse)} disabled={!selectedCourse} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300">Assigner</button>
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
  const [availableCourses, setAvailableCourses] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      setTeachers([
        { id: 1, name: 'Dr. Ada Lovelace', rank: 'Professeur', courses: 'PROG101, DBAS401', status: 'Actif' },
        { id: 2, name: 'Dr. Alan Turing', rank: 'Professeur', courses: 'PROG201', status: 'Actif' },
        { id: 3, name: 'Dr. Grace Hopper', rank: 'Chargé de cours', courses: 'PROG301', status: 'Actif' },
        { id: 4, name: 'Mr. John Doe', rank: 'Assistant', courses: 'TP PROG101', status: 'Congé' },
      ]);
      setAvailableCourses([
        { id: 'CS101', name: 'Introduction to Computer Science' },
        { id: 'CS202', name: 'Data Structures' },
        { id: 'CS303', name: 'Algorithms' },
      ]);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleAssignCourse = (teacherId, courseId) => {
    console.log(`Assigning course ${courseId} to teacher ${teacherId}`);
    alert(`Cours ${courseId} assigné (simulation).`);
    setTeachers(teachers.map(t => 
      t.id === teacherId ? { ...t, courses: t.courses ? `${t.courses}, ${courseId}` : courseId } : t
    ));
    handleCloseModal();
  };

  const stats = useMemo(() => {
      const activeTeachers = teachers.filter(t => t.status === 'Actif').length;
      const onLeave = teachers.filter(t => t.status !== 'Actif').length;
      return { total: teachers.length, active: activeTeachers, onLeave };
  }, [teachers]);

  return (
    <div className="grid gap-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Gestion des Enseignants</h2>
            <p className="text-gray-600 mt-1">Gérez les enseignants, leur statut et l\'attribution des cours.</p>
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
                    <p className="text-sm font-medium text-gray-500">En Congé</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '-' : stats.onLeave}</p>
                </div>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-60" /><Skeleton className="h-60" /><Skeleton className="h-60" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map(teacher => (
                    <TeacherCard key={teacher.id} teacher={teacher} onAssignClick={handleOpenModal} />
                ))}
            </div>
        )}

        {isModalOpen && (
            <AssignCourseModal teacher={selectedTeacher} courses={availableCourses} onClose={handleCloseModal} onAssign={handleAssignCourse} />
        )}
    </div>
  );
}
