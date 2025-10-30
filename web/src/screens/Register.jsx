import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../shared/ToastProvider';

export default function Register() {
  const [step, setStep] = useState(1); // 1: verification, 2: confirmation, 3: password
  const [matricule, setMatricule] = useState('');
  const [userData, setUserData] = useState(null);
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/accounts/verify-identity/', { matricule });
      setUserData(response.data);
      setStep(2);
    } catch (error) {
      toast.push({ kind: 'error', title: 'Erreur de vérification', message: error.response?.data?.detail || 'Matricule non trouvé.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = (isConfirmed) => {
    if (isConfirmed) {
      setStep(3);
    } else {
      setStep(1);
      setUserData(null);
      setMatricule('');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.push({ kind: 'error', title: 'Erreur', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('/api/accounts/register/', {
        matricule: matricule,
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <label className="block text-sm">Numéro Matricule
              <input name="matricule" required value={matricule} onChange={(e) => setMatricule(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </label>
            <button type="submit" className="btn w-full justify-center" disabled={isLoading}>
              {isLoading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 text-left text-sm">
              <h4 className="font-semibold text-base mb-2">Confirmez-vous ces informations ?</h4>
              <p><span className="text-slate-400">Nom:</span> {userData.nom_complet}</p>
              <p><span className="text-slate-400">Sexe:</span> {userData.sexe}</p>
              <p><span className="text-slate-400">Rôle:</span> {userData.role}</p>
              {userData.role === 'Étudiant' && (
                <>
                  <div className="my-2 border-t border-slate-700"></div>
                  <p><span className="text-slate-400">Section:</span> {userData.section || 'N/A'}</p>
                  <p><span className="text-slate-400">Département:</span> {userData.departement || 'N/A'}</p>
                  <p><span className="text-slate-400">Auditoire:</span> {userData.auditoire || 'N/A'}</p>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleConfirmation(false)} className="btn-secondary w-full justify-center">Non, réessayer</button>
              <button onClick={() => handleConfirmation(true)} className="btn w-full justify-center">Oui, c'est moi</button>
            </div>
          </div>
        );
      case 3:
        return (
          <form onSubmit={handleRegistrationSubmit} className="space-y-4">
            <label className="block text-sm">Nouveau mot de passe
              <input type="password" name="new_password" required onChange={handlePasswordChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </label>
            <label className="block text-sm">Confirmer le mot de passe
              <input type="password" name="confirm_password" required onChange={handlePasswordChange} className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </label>
            <button type="submit" className="btn w-full justify-center" disabled={isLoading}>
              {isLoading ? 'Création du compte...' : 'Créer le compte'}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="card w-[420px] p-6">
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 text-brand-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 4.9v9.8L12 22l-9-5.3V6.9L12 2zm0 2.2L5 7v7l7 4.1L19 14V7l-7-2.8z"/></svg>
            <h1 className="text-xl font-semibold">Portail Universitaire</h1>
          </div>
          <p className="text-sm text-slate-400">Inscription - Étape {step} sur 3</p>
        </div>
        
        {renderStep()}

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
