import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ allowedRoles }) => {
    const { me } = useSelector(state => state.auth);

    // Si les infos utilisateur ne sont pas encore chargées, on attend
    if (!me) {
        return <div>Chargement des permissions...</div>;
    }

    // On vérifie si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (allowedRoles.includes(me.role)) {
        return <Outlet />;
    }
    // Rôle non autorisé: au lieu d'afficher "Accès refusé", on renvoie vers l'accueil (RoleLanding)
    return <Navigate to="/" replace />;
};

export default RoleRoute;
