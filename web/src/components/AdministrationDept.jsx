import React, { useState } from 'react';

// Dummy data for documents
const initialDocuments = [
  { id: 1, name: 'Emploi du temps - Semestre 1', type: 'PDF', lastModified: '2023-09-01' },
  { id: 2, name: 'PV de la réunion du 15/10', type: 'DOCX', lastModified: '2023-10-16' },
  { id: 3, name: 'Rapport d\'activités - Octobre', type: 'PDF', lastModified: '2023-11-05' },
  { id: 4, name: 'Liste des sujets de mémoires', type: 'XLSX', lastModified: '2023-11-10' },
];

export default function AdministrationDept() {
  const [documents, setDocuments] = useState(initialDocuments);

  const handleGenerateReport = () => {
    // In a real application, this would trigger a report generation process
    alert('Génération du rapport mensuel en cours...');
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-gray-700">Coordination Administrative</h2>
      <p className="text-gray-600">
        Gérer les documents administratifs du département et préparer les rapports pour le Chef de Section.
      </p>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Documents du Département</h3>
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li key={doc.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{doc.name}</p>
                <p className="text-sm text-gray-500">Type: {doc.type} - Modifié le: {doc.lastModified}</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 font-semibold">Télécharger</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Rapports</h3>
        <p className="text-gray-600 mb-4">Générez des rapports d'activités mensuels ou des statistiques sur la performance du département.</p>
        <button 
          onClick={handleGenerateReport}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          Générer un Rapport Mensuel
        </button>
      </div>
    </div>
  );
}
