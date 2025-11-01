import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleLanding = () => {
    const navigate = useNavigate();
    const { me } = useSelector(state => state.auth);

    useEffect(() => {
        // Si les infos utilisateur sont chargées et qu'un rôle est défini
        if (me && me.role) {
            const userRole = me.role;
            switch (userRole) {
                case 'etudiant':
                    navigate('/etudiant', { replace: true });
                    break;
                case 'assistant':
                case 'professeur': // Assuming 'professeur' also uses the assistant layout/dashboard
                    navigate('/assistant', { replace: true });
                    break;
                // Ajoutez tous les autres cas ici...
                case 'pdg': navigate('/pdg', { replace: true }); break;
                case 'dg': navigate('/dg', { replace: true }); break; // Corrected from 'directeur_general' to 'dg'
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
                    // Si un rôle inconnu arrive, on renvoie vers l'accueil plutôt que d'afficher une erreur
                    navigate('/', { replace: true });
                    break;
            }
        } else if (me && !me.role) {
            // Si l'utilisateur est connecté mais sans rôle, on revient à l'accueil
            navigate('/', { replace: true });
        }
    }, [me, navigate]);

    // On ne devrait pas voir ce message longtemps si tout fonctionne
    return (
        <div className="min-h-screen grid place-items-center">
            <p>Redirection en cours...</p>
        </div>
    );
};

export default RoleLanding;
