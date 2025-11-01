import React, { useState, useEffect } from 'react';
import axios from '../api/configAxios';
import { toast } from 'react-toastify';

const CreateScheduleModal = ({ isOpen, onClose, departmentId, onScheduleCreated }) => {
    const [auditoires, setAuditoires] = useState([]);
    const [selectedAuditoire, setSelectedAuditoire] = useState('');
    const [sessionType, setSessionType] = useState('session'); // Default to 'session'
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const sessionTypes = [
        { value: 'session', label: 'Session Normale' },
        { value: 'mi-session', label: 'Mi-Session' }
    ];

    // Fetch auditoires for the department
    useEffect(() => {
        if (!departmentId) return;

        const fetchAuditoires = async () => {
            try {
                const response = await axios.get(`/api/department/auditoriums`);
                setAuditoires(response.data);
            } catch (error) {
                console.error("Error fetching auditoires:", error);
                toast.error("Erreur lors du chargement des auditoires.");
            }
        };
        fetchAuditoires();
    }, [departmentId]);

    // Fetch courses based on selected auditoire and session type
    useEffect(() => {
        if (selectedAuditoire && departmentId) {
            const fetchCourses = async () => {
                try {
                    const response = await axios.get(`/api/department/auditoriums/${selectedAuditoire}/courses/?session_type=${sessionType}`);
                    setCourses(response.data);
                    setSelectedCourse(''); // Reset selected course when auditoire or session type changes
                } catch (error) {
                    console.error("Error fetching courses:", error);
                    toast.error("Erreur lors du chargement des cours.");
                }
            };
            fetchCourses();
        } else {
            setCourses([]);
            setSelectedCourse('');
        }
    }, [selectedAuditoire, sessionType, departmentId]);

    // Fetch teachers for the department
    useEffect(() => {
        if (!departmentId) return;

        const fetchTeachers = async () => {
            try {
                const response = await axios.get(`/api/department/teachers`);
                setTeachers(response.data);
            } catch (error) {
                console.error("Error fetching teachers:", error);
                toast.error("Erreur lors du chargement des enseignants.");
            }
        };
        fetchTeachers();
    }, [departmentId]);

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        // Automatically set teacher if course has one
        const course = courses.find(c => c.id === parseInt(courseId));
        if (course && course.teacher_id) {
            setSelectedTeacher(course.teacher_id);
        } else {
            setSelectedTeacher('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                day,
                startTime,
                endTime,
                course: selectedCourse || null, // Can be null if optional
                teacher: selectedTeacher || null, // Can be null if optional
                session_type: sessionType,
            };
            await axios.post(`/api/department/auditoriums/${selectedAuditoire}/schedules`, payload);
            toast.success("Horaire créé avec succès !");
            onScheduleCreated();
            onClose();
        } catch (error) {
            console.error("Error creating schedule:", error);
            toast.error("Erreur lors de la création de l'horaire.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Créer un Nouvel Horaire</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="auditoire" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auditoire:</label>
                        <select
                            id="auditoire"
                            value={selectedAuditoire}
                            onChange={(e) => setSelectedAuditoire(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                        >
                            <option value="">Sélectionner un auditoire</option>
                            {auditoires.map(aud => (
                                <option key={aud.id} value={aud.id}>{aud.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Session:</label>
                        <select
                            id="sessionType"
                            value={sessionType}
                            onChange={(e) => setSessionType(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                        >
                            {sessionTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cours (Optionnel):</label>
                        <select
                            id="course"
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">Sélectionner un cours</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.intitule} ({course.teacher})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enseignant:</label>
                        <select
                            id="teacher"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">Aucun enseignant sélectionné</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jour:</label>
                        <select
                            id="day"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                        >
                            <option value="">Sélectionner un jour</option>
                            {daysOfWeek.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heure de début:</label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heure de fin:</label>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Création...' : 'Créer Horaire'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateScheduleModal;
