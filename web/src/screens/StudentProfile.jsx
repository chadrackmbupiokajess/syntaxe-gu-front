import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';
import { safeGet } from '../api/safeGet';

// Icon for camera/upload
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    safeGet('/api/student/profile', null).then(r => {
      setProfile(r);
      setFormData({ 
        prenom: r.prenom, 
        nom: r.nom, 
        email: r.email, 
        phone: r.phone, 
        address: r.address 
      });
      setProfilePicturePreview(r.avatar); // Set initial preview to current avatar
    });
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (profilePictureFile) {
        data.append('profile_picture', profilePictureFile);
      }

      await axios.patch('/api/student/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.push({ title: 'Informations mises à jour', message: 'Votre profil a été sauvegardé.' });
    } catch (error) {
      toast.push({ kind: 'error', title: 'Erreur', message: 'Impossible de sauvegarder le profil.' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.push({ kind: 'error', title: 'Erreur', message: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    try {
      await axios.patch('/api/student/profile', { 
        current_password: passwordData.current_password, 
        new_password: passwordData.new_password 
      });
      toast.push({ title: 'Mot de passe mis à jour', message: 'Votre mot de passe a été changé.' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.push({ kind: 'error', title: 'Erreur', message: error.response?.data?.detail || 'Impossible de changer le mot de passe.' });
    }
  };

  if (!profile) return <div className="card p-4">Chargement...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- User Card --- */}
      <div className="lg:col-span-1">
        <div className="card bg-slate-800 p-6 text-center shadow-lg">
          <div className="relative w-32 h-32 rounded-full mx-auto group">
            <img src={profilePicturePreview || profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-700" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()} 
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white"
              title="Changer la photo de profil"
            >
              <CameraIcon />
            </button>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-white">{formData.prenom} {formData.nom}</h2>
            <p className="text-sm text-slate-400">Étudiant</p>
          </div>
        </div>
        {/* --- Academic Info --- */}
        <div className="card bg-white dark:bg-slate-800 p-6 shadow-lg mt-8">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Informations Académiques</h3>
          <div className="grid grid-cols-1 gap-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Matricule:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{profile.matricule}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Auditoire:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{profile.auditorium}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Session:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{profile.session}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Département:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{profile.department}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Faculté:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{profile.faculty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Forms --- */}
      <div className="lg:col-span-2 space-y-8">
        {/* --- Profile Info Form --- */}
        <div className="card bg-white dark:bg-slate-800 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Informations Personnelles</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Prénom
                     <input name="prenom" value={formData.prenom || ''} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nom
                    <input name="nom" value={formData.nom || ''} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
            </div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Adresse E-mail
                <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Téléphone
                <input name="phone" value={formData.phone || ''} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Adresse
                <input name="address" value={formData.address || ''} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
            </label>
            <div className="text-right">
              <button type="submit" className="btn">Enregistrer les modifications</button>
            </div>
          </form>
        </div>

        {/* --- Password Change Form --- */}
        <div className="card bg-white dark:bg-slate-800 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Changer le mot de passe</h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Mot de passe actuel
                <input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nouveau mot de passe
                    <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Confirmer le nouveau mot de passe
                    <input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
            </div>
            <div className="text-right">
              <button type="submit" className="btn">Changer le mot de passe</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
