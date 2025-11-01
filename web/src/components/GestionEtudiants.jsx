import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';
import KpiCard from './KpiCard';

// Icons (assuming these are already defined or imported elsewhere, or we can define them here)
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5c1.706 0 3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253" /></svg>;


const getPromotionColor = (promotion) => {
    const promoLower = promotion.toLowerCase();
    if (promoLower.includes('licence')) return 'bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
    if (promoLower.includes('master')) return 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const StudentCard = ({ student }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="p-5">
            <div className="flex items-center space-x-4">
                <img className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-400" src={`https://i.pravatar.cc/150?u=${student.matricule}`} alt={student.name} />
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Matricule: {student.matricule}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-gray-100 dark:border-slate-700 pt-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPromotionColor(student.promotion)}`}>{student.promotion}</span>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Département: {student.department}</p>
            </div>
            <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progression Académique</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: `${student.progress || 0}%` }}></div>
                </div>
                <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{student.progress || 0}%</p>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700 px-5 py-3 flex justify-end space-x-2 border-t border-gray-100 dark:border-slate-700">
            <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600">Voir Dossier</button>
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900">Envoyer Message</button>
        </div>
    </div>
);

export default function GestionEtudiants({ currentRole }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ name: '', promotion: '', department: '' });
    const [summary, setSummary] = useState(null); // For department/section summary

    const isDepartmentRole = currentRole === 'chef_departement';
    // Dynamically set the page title based on the role
    const pageTitle = isDepartmentRole
        ? 'Gestion des Étudiants du Département' // Hardcoded for demonstration as requested
        : 'Gestion des Étudiants de la Section';
    const pageDescription = isDepartmentRole
        ? 'Gérez et suivez les étudiants de votre département.'
        : 'Gérez et suivez les étudiants de votre section.';

    const loadStudentsAndSummary = async () => {
        setLoading(true);
        try {
            const studentsApiEndpoint = isDepartmentRole ? '/api/department/students' : '/api/section/students';
            const summaryApiEndpoint = isDepartmentRole ? '/api/department/summary' : '/api/section/summary';

            const [studentsResponse, summaryResponse] = await Promise.all([
                axios.get(studentsApiEndpoint),
                axios.get(summaryApiEndpoint),
            ]);

            setStudents(studentsResponse.data);
            setSummary(summaryResponse.data);
        } catch (error) {
            console.error("Failed to load data for students management", error);
            setStudents([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudentsAndSummary(); }, [currentRole]); // Reload data when role changes

    const filteredStudents = useMemo(() =>
        students.filter(s =>
            s.name.toLowerCase().includes(filters.name.toLowerCase()) &&
            (filters.promotion === '' || s.promotion === filters.promotion) &&
            (filters.department === '' || s.department === filters.department)
        ), [students, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const uniquePromotions = useMemo(() => [...new Set(students.map(s => s.promotion))], [students]);
    const uniqueDepartments = useMemo(() => [...new Set(students.map(s => s.department))], [students]);

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
                    <KpiCard label="Total Étudiants" value={summary?.students?.val || 0} color="bg-gradient-to-r from-blue-500 to-blue-600" icon={<UsersIcon />} />
                    <KpiCard label="Étudiants en Licence" value={filteredStudents.filter(s => s.promotion.toLowerCase().includes('licence')).length} color="bg-gradient-to-r from-green-500 to-green-600" icon={<AcademicCapIcon />} />
                    <KpiCard label="Étudiants en Master" value={filteredStudents.filter(s => s.promotion.toLowerCase().includes('master')).length} color="bg-gradient-to-r from-purple-500 to-purple-600" icon={<BookOpenIcon />} />
                    <KpiCard label="Taux de Réussite Global" value={summary?.successRate?.val ? `${summary.successRate.val}%` : 'N/A'} color="bg-gradient-to-r from-orange-500 to-orange-600" icon={<AcademicCapIcon />} />
                </div>
            )}

            {/* Filters and Actions Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-4">
                    <input type="text" name="name" placeholder="Rechercher par nom..." onChange={handleFilterChange} className="border border-gray-300 dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                    <select name="promotion" onChange={handleFilterChange} className="border border-gray-300 dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Toutes les promotions</option>
                        {uniquePromotions.map(promo => <option key={`promo-${promo}`} value={promo}>{promo}</option>)}
                    </select>
                    {isDepartmentRole && ( // Only show department filter if it's a section role
                        <select name="department" onChange={handleFilterChange} className="border border-gray-300 dark:border-slate-600 p-2 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Tous les départements</option>
                            {uniqueDepartments.map(dep => <option key={`dep-${dep}`} value={dep}>{dep}</option>)}
                        </select>
                    )}
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    + Inscrire un Étudiant
                </button>
            </div>

            {/* Student List Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-60" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => <StudentCard key={student.matricule} student={student} />)}
                </div>
            )}
        </div>
    );
}