import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import ListWithFilters from '../components/ListWithFilters';

// Dummy Icons
const PaperAirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MailOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 4v7a2 2 0 002 2h14a2 2 0 002-2v-7m-18 0l-2-2m20 2l2-2m-10-2a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2h-4z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 4v7a2 2 0 002 2h14a2 2 0 002-2v-7M3 8l7.89 5.26a2 2 0 002.22 0L21 8" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;

export default function DgCommunication() {
  // Dummy Data
  const [communicationSummary] = useState({
    totalMessagesSent: 150,
    unreadMessages: 12,
    averageResponseTime: '2h',
    activeUsers: 85,
  });

  const [internalMessages, setInternalMessages] = useState([
    { id: 1, subject: 'Réunion du Conseil de Direction', content: 'La réunion aura lieu le 15 novembre...', sender: 'DG', date: '2023-10-24', status: 'Envoyé' },
    { id: 2, subject: 'Nouvelles directives budgétaires', content: 'Veuillez prendre note des nouvelles...', sender: 'DG', date: '2023-10-23', status: 'Envoyé' },
    { id: 3, subject: 'Rappel: Soumission des rapports', content: 'N\'oubliez pas de soumettre vos rapports...', sender: 'DG', date: '2023-10-22', status: 'Envoyé' },
    { id: 4, subject: 'Demande d\'information', content: 'Pourriez-vous me fournir les données de...', sender: 'Secrétaire Général', date: '2023-10-21', status: 'Reçu' },
  ]);

  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipients: 'all', // 'all', 'chefs_departement', 'direction_academique'
  });

  const handleSendMessage = () => {
    if (newMessage.subject && newMessage.content) {
      const newMsg = {
        id: internalMessages.length + 1,
        subject: newMessage.subject,
        content: newMessage.content,
        sender: 'DG',
        date: new Date().toISOString().slice(0, 10),
        status: 'Envoyé',
      };
      setInternalMessages([newMsg, ...internalMessages]);
      setNewMessage({ subject: '', content: '', recipients: 'all' });
      alert('Message envoyé avec succès !');
    } else {
      alert('Veuillez remplir le sujet et le contenu du message.');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Communication Interne</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Gérez et suivez les communications officielles de l'établissement.</p>

      {/* Global Communication KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Messages Envoyés" value={communicationSummary.totalMessagesSent} icon={<PaperAirplaneIcon />} color="bg-blue-600 dark:bg-blue-800" />
        <KpiCard label="Messages Non Lus" value={communicationSummary.unreadMessages} icon={<MailOpenIcon />} color="bg-orange-600 dark:bg-orange-800" />
        <KpiCard label="Temps de Réponse Moyen" value={communicationSummary.averageResponseTime} icon={<MailIcon />} color="bg-green-600 dark:bg-green-800" />
        <KpiCard label="Utilisateurs Actifs" value={communicationSummary.activeUsers} icon={<UsersIcon />} color="bg-purple-600 dark:bg-purple-800" />
      </div>

      {/* Send New Message Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Envoyer un Nouveau Message</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sujet</label>
            <input
              type="text"
              id="subject"
              className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              placeholder="Sujet du message..."
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu</label>
            <textarea
              id="content"
              className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
              rows="4"
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              placeholder="Rédigez votre message ici..."
            ></textarea>
          </div>
          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destinataires</label>
            <select
              id="recipients"
              className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
              value={newMessage.recipients}
              onChange={(e) => setNewMessage({ ...newMessage, recipients: e.target.value })}
            >
              <option value="all">Tous les chefs</option>
              <option value="chefs_departement">Chefs de Département</option>
              <option value="direction_academique">Direction Académique</option>
            </select>
          </div>
          <div className="text-right">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSendMessage}
            >
              Envoyer Message
            </button>
          </div>
        </div>
      </div>

      {/* Messages Sent List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Messages Envoyés</h3>
        <ListWithFilters
          title=""
          data={internalMessages}
          columns={[
            { key: 'date', header: 'Date' },
            { key: 'sender', header: 'Expéditeur' },
            { key: 'subject', header: 'Sujet' },
            { key: 'status', header: 'Statut' },
          ]}
          filters={[
            { key: 'subject', label: 'Sujet', type: 'text', placeholder: 'Sujet' },
            { key: 'sender', label: 'Expéditeur', type: 'text', placeholder: 'Expéditeur' },
            { key: 'status', label: 'Statut', type: 'select', options: [{ value: 'Envoyé', label: 'Envoyé' }, { value: 'Reçu', label: 'Reçu' }] },
          ]}
          actions={[
            { label: 'Voir', onClick: (row) => alert(`Contenu: ${row.content}`) },
          ]}
        />
      </div>
    </div>
  );
}
