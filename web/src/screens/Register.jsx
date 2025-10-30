import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function Register() {
  const [verificationData, setVerificationData] = useState({
    nom: '',
    postnom: '',
    prenom: '',
    matricule: '',
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });
  
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleVerificationChange = (e) => {
    setVerificationData({ ...verificationData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Remplacer par le vrai endpoint de vérification
      await axios.post('/api/verify-identity', verificationData);
      setIsVerified(true);
      toast.push({ title: 'Vérification réussie', message: 'Vous pouvez maintenant créer votre mot de passe.' });
    } catch (error) {
      toast.push({ kind: 'error', title: 'Erreur de vérification', message: error.response?.data?.detail || 'Utilisateur non trouvé. Veuillez vérifier vos informations.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.push({ kind: 'error', title: 'Erreur', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setIsLoading(true);
    try {
      // TODO: Remplacer par le vrai endpoint de création de compte
      await axios.post('/api/register/create-password', {
        matricule: verificationData.matricule,
        password: passwordData.new_password,
      });
      toast.push({ title: 'Inscription réussie', message: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.' });
      navigate('/login');
    } catch (error) {
      toast.push({ kind: 'error', title: 'Erreur d\'inscription', message: error.response?.data?.detail || 'Une erreur est survenue.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderVerificationForm = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm">Nom
          <input name="nom" required onChange={handleVerificationChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </label>
        <label className="block text-sm">Post-nom
          <input name="postnom" onChange={handleVerificationChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </label>
      </div>
      <label className="block text-sm">Prénom
        <input name="prenom" required onChange={handleVerificationChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
      </label>
      <label className="block text-sm">Matricule
        <input name="matricule" required onChange={handleVerificationChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
      </label>
      <button type="submit" className="btn w-full justify-center" disabled={isLoading}>
        {isLoading ? 'Vérification...' : 'Vérifier'}
      </button>
    </form>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handleRegistrationSubmit} className="space-y-4">
       <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 text-center">
        <p className="font-semibold">{verificationData.prenom} {verificationData.nom}</p>
        <p className="text-sm text-slate-400">{verificationData.matricule}</p>
      </div>
      <label className="block text-sm">Nouveau mot de passe
        <input type="password" name="new_password" required onChange={handlePasswordChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
      </label>
      <label className="block text-sm">Confirmer le mot de passe
        <input type="password" name="confirm_password" required onChange={handlePasswordChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
      </label>
      <button type="submit" className="btn w-full justify-center" disabled={isLoading}>
        {isLoading ? 'Création...' : 'Créer le compte'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="card w-[420px] p-6">
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 text-brand-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 4.9v9.8L12 22l-9-5.3V6.9L12 2zm0 2.2L5 7v7l7 4.1L19 14V7l-7-2.8z"/></svg>
            <h1 className="text-xl font-semibold">Portail Universitaire</h1>
          </div>
          <p className="text-sm text-slate-400">{isVerified ? 'Finaliser l\'inscription' : 'Inscription'}</p>
        </div>
        
        {isVerified ? renderPasswordForm() : renderVerificationForm()}

        <div className="mt-6 text-center text-sm text-slate-400">
          Vous avez déjà un compte?{' '}
          <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
