import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { fetchMe } from '../store/authSlice';

const RoleLanding = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { access, me, status } = useSelector(state => state.auth);

    useEffect(() => {
        // Si on a un token mais pas les infos utilisateur, on les charge
        if (access && !me) {
            dispatch(fetchMe());
            return; // On attend que les infos soient chargées
        }

        // Si on a les infos utilisateur, on redirige
        if (me && me.role) {
            const userRole = me.role;
            switch (userRole) {
                case 'etudiant':
                    navigate('/etudiant', { replace: true });
                    break;
                case 'assistant':
                case 'enseignant':
                    navigate('/assistant', { replace: true });
                    break;
                // Ajoutez tous les autres cas ici...
                case 'pdg': navigate('/pdg', { replace: true }); break;
                case 'directeur_general': navigate('/dg', { replace: true }); break;
                case 'sga': navigate('/sga', { replace: true }); break;
                case 'sgad': navigate('/sgad', { replace: true }); break;
                case 'chef_section': navigate('/section', { replace: true }); break;
                case 'chef_departement': navigate('/departement', { replace: true }); break;
                case 'jury': navigate('/jury', { replace: true }); break;
                case 'apparitorat': navigate('/apparitorat', { replace: true }); break;
                case 'caisse': navigate('/caisse', { replace: true }); break;
                case 'service_it': navigate('/it', { replace: true }); break;
                case 'bibliothecaire': navigate('/bibliotheque', { replace: true }); break;
                default:
                    // Si le rôle n'est pas géré, on ne fait rien pour l'instant
                    break;
            }
        }
    }, [access, me, dispatch, navigate]);

    // Pendant le chargement, on affiche un loader
    if (status === 'loading' || (access && !me)) {
        return (
            <div className="min-h-screen grid place-items-center">
                <p>Vérification de l'authentification...</p>
            </div>
        );
    }

    // Si on arrive ici, c'est qu'il y a un problème (pas de rôle, etc.)
    // On peut afficher un message d'erreur ou rediriger
    return (
        <div className="min-h-screen grid place-items-center">
            <p>Impossible de déterminer votre rôle. Veuillez contacter l'administrateur.</p>
        </div>
    );
};

export default RoleLanding;
