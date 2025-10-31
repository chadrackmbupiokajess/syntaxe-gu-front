import React from 'react';

export default function CoordinationAdministrative() {

  const handleGenerateReport = (reportType) => {
    alert(`Génération du rapport "${reportType}" en cours...`);
    // In a real application, this would trigger a download or display a modal with the report.
  };

  return (
    <div className="grid gap-8 p-4 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-2xl font-semibold text-gray-700">Coordination Administrative</h2>
        <p className="mt-1 text-gray-600">
          Gérer les documents officiels, rédiger les rapports et servir de liaison avec la direction académique.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Section de génération de rapports */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800">Rapports d'Activités</h3>
          <p className="text-sm text-gray-500 mb-4">Générez des rapports mensuels ou annuels pour la section.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleGenerateReport('Rapport Mensuel')} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Rapport Mensuel
            </button>
            <button 
              onClick={() => handleGenerateReport('Rapport Annuel')} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Rapport Annuel
            </button>
          </div>
        </div>

        {/* Section des messages internes */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800">Messages Internes</h3>
          <p className="text-sm text-gray-500 mb-4">Communiquez avec les chefs de département et la direction.</p>
          <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            Ouvrir la Messagerie
          </button>
        </div>
      </div>

      {/* Espace pour la gestion de documents (future fonctionnalité) */}
      <div className="mt-4 p-4 border-t">
        <h3 className="font-semibold text-lg">Gestion des Documents</h3>
        <p className="text-gray-600">Bientôt disponible : un espace pour stocker et gérer les procès-verbaux, décisions et autres documents officiels.</p>
      </div>
    </div>
  );
}
