import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function AssistantProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const toast = useToast();

  useEffect(() => {
    axios.get('/api/assistant/profile').then(r => {
      setProfile(r.data);
      setFormData({ 
        prenom: r.data.prenom, 
        nom: r.data.nom, 
        email: r.data.email, 
        phone: r.data.phone, 
        office: r.data.office 
      });
    });
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('/api/assistant/profile', formData);
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
      await axios.patch('/api/assistant/profile', { 
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
          <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full mx-auto ring-4 ring-slate-700" />
          <div className="mt-4">
            <h2 className="text-xl font-bold text-white">{formData.prenom} {formData.nom}</h2>
            <p className="text-sm text-slate-400">Assistant</p>
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
                    <input name="prenom" value={formData.prenom} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nom
                    <input name="nom" value={formData.nom} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
            </div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Adresse E-mail
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Téléphone
                    <input name="phone" value={formData.phone} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Bureau
                    <input name="office" value={formData.office} onChange={handleFormChange} className="mt-1 w-full px-0 py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500" />
                </label>
            </div>
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
