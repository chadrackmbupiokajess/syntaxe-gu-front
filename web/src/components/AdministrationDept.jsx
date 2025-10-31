import React, { useState, useMemo } from 'react';

// --- SVG Icons for file types ---
const FilePdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const FileDocxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const FileXlsxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const getFileIcon = (type) => {
    switch (type.toUpperCase()) {
        case 'PDF': return <FilePdfIcon />;
        case 'DOCX': return <FileDocxIcon />;
        case 'XLSX': return <FileXlsxIcon />;
        default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    }
};

// --- Re-styled Document Card Component ---
const DocumentCard = ({ doc }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center p-4">
        <div className="flex-shrink-0">
            {getFileIcon(doc.type)}
        </div>
        <div className="ml-4 flex-grow">
            <h4 className="font-bold text-gray-800">{doc.name}</h4>
            <p className="text-sm text-gray-500">Modifié le: {doc.lastModified}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Télécharger</button>
        </div>
    </div>
);

// --- Main Component ---
export default function AdministrationDept() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Emploi du temps - Semestre 1', type: 'PDF', lastModified: '2023-09-01' },
    { id: 2, name: 'PV de la réunion du 15/10', type: 'DOCX', lastModified: '2023-10-16' },
    { id: 3, name: 'Rapport d\'activités - Octobre', type: 'PDF', lastModified: '2023-11-05' },
    { id: 4, name: 'Liste des sujets de mémoires', type: 'XLSX', lastModified: '2023-11-10' },
  ]);

  const handleGenerateReport = () => {
    alert('Génération du rapport mensuel en cours...');
  };

  const stats = useMemo(() => {
    const total = documents.length;
    const pdfCount = documents.filter(doc => doc.type === 'PDF').length;
    const docxCount = documents.filter(doc => doc.type === 'DOCX').length;
    const xlsxCount = documents.filter(doc => doc.type === 'XLSX').length;
    return { total, pdfCount, docxCount, xlsxCount };
  }, [documents]);

  return (
    <div className="grid gap-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Administration</h2>
            <p className="text-gray-600 mt-1">Gérez les documents officiels et générez les rapports périodiques.</p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-500">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-red-500">
                    <p className="text-sm font-medium text-gray-500">Documents PDF</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.pdfCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-500">Documents DOCX</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.docxCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-green-500">
                    <p className="text-sm font-medium text-gray-500">Documents XLSX</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.xlsxCount}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
            ))}
        </div>

        <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800">Générateur de Rapports</h3>
            <p className="text-gray-600 mt-2 mb-4">Créez des rapports d'activités mensuels ou des synthèses de performance pour la section.</p>
            <button 
              onClick={handleGenerateReport}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
            >
              Générer un Rapport Mensuel
            </button>
        </div>
    </div>
  );
}
