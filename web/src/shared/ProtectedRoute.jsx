import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe, logout } from '../store/authSlice';

const ProtectedRoute = () => {
    const { access, me, status } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Si on a un token mais pas les infos de l'utilisateur, on les récupère une seule fois (status === 'idle')
        if (access && !me && status === 'idle') {
            dispatch(fetchMe());
        }
    }, [access, me, status, dispatch]);

    useEffect(() => {
        // En cas d'échec (ex: 401), on nettoie et on redirige vers /login pour éviter une boucle infinie
        if (status === 'failed') {
            dispatch(logout());
            navigate('/login', { replace: true, state: { from: location } });
        }
    }, [status, dispatch, navigate, location]);

    // Si pas de token d'accès, on redirige vers la page de connexion
    if (!access) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si on a un token mais que les infos utilisateur ne sont pas encore chargées, on affiche un loader
    if (status === 'loading' || !me) {
        return (
            <div className="min-h-screen grid place-items-center">
                <p>Chargement des informations utilisateur...</p>
            </div>
        );
    }

    // Si tout est bon (token et infos utilisateur chargées), on affiche le contenu protégé
    return <Outlet />;
};

export default ProtectedRoute;
