import React, { useState } from 'react';

// --- Icon Components (replace with a real icon library) ---
const DocumentReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ChatAlt2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z" /></svg>;

// --- Main Component ---
export default function CoordinationAdministrative() {
  const [reportType, setReportType] = useState('monthly');
  const [reportPeriod, setReportPeriod] = useState('2023-05');
  const [reportFormat, setReportFormat] = useState('pdf');

  const recentDocuments = [
    { name: 'PV_Reunion_Mai.pdf', date: '02/06/2023', size: '1.2MB' },
    { name: 'Rapport_Activites_Prog.docx', date: '01/06/2023', size: '800KB' },
    { name: 'Notes_Examens_S2.xlsx', date: '28/05/2023', size: '2.5MB' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Coordination Administrative</h2>
        <p className="mt-2 text-lg text-gray-600">Générez des rapports, gérez les documents et communiquez efficacement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Module de Rapports --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center"><DocumentReportIcon /><h3 className="ml-3 text-xl font-bold">Générateur de Rapports</h3></div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de Rapport</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
              <option value="monthly">Rapport Mensuel</option>
              <option value="annual">Rapport Annuel</option>
              <option value="performance">Rapport de Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Période</label>
            <input type="month" value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Format</label>
            <div className="flex gap-2 mt-1">{['PDF', 'CSV', 'DOCX'].map(format => <button key={format} onClick={() => setReportFormat(format.toLowerCase())} className={`px-4 py-2 rounded-md text-sm font-medium ${reportFormat === format.toLowerCase() ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{format}</button>)}</div>
          </div>
          <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-lg mt-4">Générer le Rapport</button>
        </div>

        {/* --- Module de Gestion de Documents --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center"><UploadIcon /><h3 className="ml-3 text-xl font-bold">Gestionnaire de Documents</h3></div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p>Glissez-déposez un fichier ou <button className="text-purple-600 font-semibold">choisissez un fichier</button> pour l'ajouter.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Documents Récents</h4>
            <ul className="space-y-2">
              {recentDocuments.map(doc => (
                <li key={doc.name} className="flex justify-between items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                  <span>{doc.name}</span>
                  <span className="text-sm text-gray-500">{doc.date} - {doc.size}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Module de Communication --- */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg space-y-4">
            <div className="flex items-center"><ChatAlt2Icon /><h3 className="ml-3 text-xl font-bold">Centre de Communication</h3></div>
            <textarea placeholder="Rédigez votre message ici..." className="w-full p-2 border-gray-300 rounded-md shadow-sm" rows="4"></textarea>
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Envoyer à :</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Chefs de Département</button>
                    <button className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Direction Académique</button>
                    <button className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700">Envoyer le Message</button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
