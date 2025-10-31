import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Skeleton from './Skeleton';
import KpiCard from './KpiCard';

const getPromotionColor = (promotion) => {
    const promoLower = promotion.toLowerCase();
    if (promoLower.includes('licence')) return 'bg-sky-200 text-sky-800';
    if (promoLower.includes('master')) return 'bg-purple-200 text-purple-800';
    return 'bg-gray-200 text-gray-800';
};

const StudentCard = ({ student }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="p-5">
            <div className="flex items-center space-x-4">
                <img className="w-16 h-16 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${student.matricule}`} alt={student.name} />
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.matricule}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPromotionColor(student.promotion)}`}>{student.promotion}</span>
                <p className="text-sm font-medium text-gray-700">{student.department}</p>
            </div>
            <div className="mt-4">
                <p className="text-xs text-gray-500">Progression Académique</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                </div>
            </div>
        </div>
        <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2">
            <button className="text-xs font-semibold text-gray-600 hover:text-gray-900">Dossier</button>
            <button className="text-xs font-semibold text-sky-600 hover:text-sky-800">Message</button>
        </div>
    </div>
);

export default function GestionEtudiants() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ name: '', promotion: '', department: '' });

    const loadStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/section/students');
            setStudents(response.data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, []);

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
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Gestion des Étudiants</h2>
                <p className="mt-2 text-lg text-gray-600">Suivez la progression et gérez les dossiers de vos étudiants.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard label="Total Étudiants" value={loading ? '...' : filteredStudents.length} />
                <KpiCard label="Étudiants en Licence" value={loading ? '...' : filteredStudents.filter(s => s.promotion.toLowerCase().includes('licence')).length} />
                <KpiCard label="Étudiants en Master" value={loading ? '...' : filteredStudents.filter(s => s.promotion.toLowerCase().includes('master')).length} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-4">
                    <input type="text" name="name" placeholder="Rechercher par nom..." onChange={handleFilterChange} className="border p-2 rounded-md"/>
                    <select name="promotion" onChange={handleFilterChange} className="border p-2 rounded-md">
                        <option value="">Toutes les promotions</option>
                        {uniquePromotions.map(promo => <option key={promo} value={promo}>{promo}</option>)}
                    </select>
                    <select name="department" onChange={handleFilterChange} className="border p-2 rounded-md">
                        <option value="">Tous les départements</option>
                        {uniqueDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                </div>
                <button className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">
                    + Inscrire un Étudiant
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => <StudentCard key={student.id} student={student} />)}
                </div>
            )}
        </div>
    );
}
