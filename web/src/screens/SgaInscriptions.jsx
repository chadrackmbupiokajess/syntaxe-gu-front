import React, { useEffect, useState } from 'react';
import axios from '../api/configAxios';
import { useToast } from '../shared/ToastProvider';

export default function SgaInscriptions() {
  const { push } = useToast();
  const [sections, setSections] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [auditoires, setAuditoires] = useState([]);
  
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    post_name: '',
    email: '',
    sexe: 'M',
    profile_picture: null,
    description: '',
    phone: '',
    address: '',
    auditoire_id: '',
    office: '',
    status: 'pending',
  });

  const [view, setView] = useState('form'); // 'form' or 'preview'

  const fetchSections = async () => {
    try {
      const response = await axios.get('/api/section/list');
      setSections(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des sections.', status: 'error' });
    }
  };

  const fetchDepartements = async (sectionId) => {
    try {
      const response = await axios.get(`/api/sga/departements?section_id=${sectionId}`);
      setDepartements(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des départements.', status: 'error' });
    }
  };

  const fetchAuditoires = async (departementId) => {
    try {
      const response = await axios.get(`/api/sga/auditoires?departement_id=${departementId}`);
      setAuditoires(response.data);
    } catch (error) {
      push({ title: 'Erreur', message: 'Erreur lors du chargement des auditoires.', status: 'error' });
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchDepartements(selectedSection);
      setDepartements([]);
      setAuditoires([]);
      setSelectedDepartement('');
      setFormData(prev => ({ ...prev, auditoire_id: '' }));
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedDepartement) {
      fetchAuditoires(selectedDepartement);
      setAuditoires([]);
      setFormData(prev => ({ ...prev, auditoire_id: '' }));
    }
  }, [selectedDepartement]);

  const handleChange = (e) => {
    if (e.target.name === 'profile_picture') {
      setFormData({ ...formData, profile_picture: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setView('preview');
  };

  const handleEdit = () => {
    setView('form');
  };

  const handleConfirm = async () => {
    const postData = new FormData();
    for (const key in formData) {
      postData.append(key, formData[key]);
    }

    try {
      const response = await axios.post('/api/sga/student-management/create-inscription', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      push({ title: 'Succès', message: `Étudiant ${response.data.full_name} inscrit avec succès. Mot de passe: ${response.data.password}` });
      setFormData({ first_name: '', last_name: '', post_name: '', email: '', sexe: 'M', profile_picture: null, description: '', phone: '', address: '', auditoire_id: '', office: '', status: 'pending' });
      setSelectedSection('');
      setSelectedDepartement('');
      setView('form');
    } catch (error) {
      push({ title: 'Erreur', message: error.response?.data?.detail || 'Une erreur est survenue.', status: 'error' });
    }
  };

  if (view === 'preview') {
    const selectedSectionObj = sections.find(s => s.id === parseInt(selectedSection));
    const selectedDepartementObj = departements.find(d => d.id === parseInt(selectedDepartement));
    const selectedAuditoire = auditoires.find(a => a.id === parseInt(formData.auditoire_id));
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Prévisualisation de l'Inscription</h2>
        <div className="space-y-4">
          <div><strong>Prénom:</strong> {formData.first_name}</div>
          <div><strong>Nom:</strong> {formData.last_name}</div>
          <div><strong>Post-nom:</strong> {formData.post_name}</div>
          <div><strong>Email:</strong> {formData.email}</div>
          <div><strong>Sexe:</strong> {formData.sexe === 'M' ? 'Masculin' : 'Féminin'}</div>
          <div><strong>Téléphone:</strong> {formData.phone}</div>
          <div><strong>Adresse:</strong> {formData.address}</div>
          <div><strong>Section:</strong> {selectedSectionObj?.name}</div>
          <div><strong>Département:</strong> {selectedDepartementObj?.name}</div>
          <div><strong>Auditoire:</strong> {selectedAuditoire?.name}</div>
          <div><strong>Description:</strong> {formData.description}</div>
          {formData.profile_picture && <div><strong>Photo de profil:</strong> <img src={URL.createObjectURL(formData.profile_picture)} alt="Profile Preview" className="h-24 w-24 object-cover rounded-full" /></div>}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={handleEdit} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">Modifier</button>
          <button onClick={handleConfirm} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">Valider</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Inscrire un Nouvel Étudiant</h2>
      <form onSubmit={handlePreview} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
              <input type="text" name="first_name" id="first_name" value={formData.first_name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
              <input type="text" name="last_name" id="last_name" value={formData.last_name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="post_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Post-nom</label>
              <input type="text" name="post_name" id="post_name" value={formData.post_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sexe</label>
              <select name="sexe" id="sexe" value={formData.sexe} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
             <div>
              <label htmlFor="office" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Office</label>
              <input type="text" name="office" id="office" value={formData.office} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo de profil</label>
              <div className="mt-1 flex items-center">
                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                  {formData.profile_picture ? <img src={URL.createObjectURL(formData.profile_picture)} alt="Profile" className="h-full w-full object-cover" /> : <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.993A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                </span>
                <label htmlFor="profile_picture" className="ml-5 bg-white dark:bg-slate-700 py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 cursor-pointer">
                  <span>Changer</span>
                  <input id="profile_picture" name="profile_picture" type="file" className="sr-only" onChange={handleChange} />
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
              <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"></textarea>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
            <select id="section" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
              <option value="">Sélectionner une section</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="departement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Département</label>
            <select id="departement" value={selectedDepartement} onChange={(e) => setSelectedDepartement(e.target.value)} required disabled={!selectedSection} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
              <option value="">Sélectionner un département</option>
              {departements.map(departement => (
                <option key={departement.id} value={departement.id}>{departement.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="auditoire_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auditoire</label>
            <select name="auditoire_id" id="auditoire_id" value={formData.auditoire_id} onChange={handleChange} required disabled={!selectedDepartement} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500">
              <option value="">Sélectionner un auditoire</option>
              {auditoires.map(auditoire => (
                <option key={auditoire.id} value={auditoire.id}>{auditoire.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            Prévisualiser l'inscription
          </button>
        </div>
      </form>
    </div>
  );
}
