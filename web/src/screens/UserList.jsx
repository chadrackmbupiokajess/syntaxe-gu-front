import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users/')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the users!", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="card p-4">Chargement...</div>;
  }

  return (
    <div className="card p-4">
      <h1 className="text-xl font-semibold mb-4">Liste des Utilisateurs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nom d’utilisateur</th>
              <th scope="col" className="px-6 py-3">Matricule</th>
              <th scope="col" className="px-6 py-3">Adresse électronique</th>
              <th scope="col" className="px-6 py-3">Nom complet</th>
              <th scope="col" className="px-6 py-3">Rôle</th>
              <th scope="col" className="px-6 py-3">Auditoire</th>
              <th scope="col" className="px-6 py-3">Statut</th>
              <th scope="col" className="px-6 py-3">Statut équipe</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.matricule} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.matricule}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.full_name}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.auditoire}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Activé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">{user.team_status ? 'True' : 'False'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
