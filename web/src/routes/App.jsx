import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import Layout from '../components/Layout';
import StudentLayout from '../components/StudentLayout';
import AssistantLayout from '../components/AssistantLayout';
import ProtectedRoute from '../shared/ProtectedRoute';
import RoleRoute from '../shared/RoleRoute';
import Unauthorized from '../shared/Unauthorized';

// Pages
import Login from '../screens/Login';
import RoleLanding from '../screens/RoleLanding';
import PDGDashboard from '../screens/PDGDashboard';
import DgDashboard from '../screens/DgDashboard';
import SgaDashboard from '../screens/SgaDashboard';
import SgadDashboard from '../screens/SgadDashboard';
import SectionDashboard from '../screens/SectionDashboard';
import DepartementDashboard from '../screens/DepartementDashboard';
import JuryDashboard from '../screens/JuryDashboard';
import ApparitoratDashboard from '../screens/ApparitoratDashboard';
import CaisseDashboard from '../screens/CaisseDashboard';
import ITDashboard from '../screens/ITDashboard';
import BibliothequeDashboard from '../screens/BibliothequeDashboard';

// Pages Étudiant
import StudentDashboard from '../screens/StudentDashboard';
import StudentWork from '../screens/StudentWork';
import StudentCourses from '../screens/StudentCourses';
import StudentChat from '../screens/StudentChat';
import StudentNotifications from '../screens/StudentNotifications';
import StudentCalendar from '../screens/StudentCalendar';
import StudentLibrary from '../screens/StudentLibrary';
import StudentPayments from '../screens/StudentPayments';
import StudentNotes from '../screens/StudentNotes';
import StudentDocuments from '../screens/StudentDocuments';
import StudentProfile from '../screens/StudentProfile';

// Pages Assistant/Enseignant
import AssistantDashboard from '../screens/AssistantDashboard';
import AssistantAuditoriums from '../screens/AssistantAuditoriums';
import AssistantAuditoriumDetails from '../screens/AssistantAuditoriumDetails';
import AssistantAuditoriumMessage from '../screens/AssistantAuditoriumMessage';
import AssistantMessages from '../screens/AssistantMessages'; // New import
import AssistantNewTPTD from '../screens/AssistantNewTPTD';
import AssistantNewQuiz from '../screens/AssistantNewQuiz';
import AssistantGrades from '../screens/AssistantGrades';
import AssistantTPTD from '../screens/AssistantTPTD';
import AssistantQuizzes from '../screens/AssistantQuizzes';
import AssistantToGrade from '../screens/AssistantToGrade';
import AssistantProfile from '../screens/AssistantProfile';
import AssistantStudentProfile from '../screens/AssistantStudentProfile'; // New import

export default function App() {
  return (
    <Routes>
      {/* Route publique pour la connexion */}
      <Route path="/login" element={<Login />} />

      {/* Routes protégées qui nécessitent une connexion */}
      <Route element={<ProtectedRoute />}>
        {/* Toutes les routes ici partagent le Layout principal (Navbar, etc.) */}
        <Route element={<Layout />}>
          <Route path="/" element={<RoleLanding />} />

          {/* Routes pour l'Étudiant */}
          <Route path="/etudiant" element={<RoleRoute allowedRoles={['etudiant']} />}>
            <Route element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="travaux" element={<StudentWork />} />
              <Route path="cours" element={<StudentCourses />} />
              <Route path="chat" element={<StudentChat />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="calendrier" element={<StudentCalendar />} />
              <Route path="bibliotheque" element={<StudentLibrary />} />
              <Route path="profil" element={<StudentProfile />} />
              <Route path="notes" element={<StudentNotes />} />
              <Route path="documents" element={<StudentDocuments />} />
              <Route path="paiements" element={<StudentPayments />} />
            </Route>
          </Route>

          {/* Routes pour l'Assistant/Enseignant */}
          <Route path="/assistant" element={<RoleRoute allowedRoles={['assistant', 'enseignant']} />}>
            <Route element={<AssistantLayout />}>
              <Route index element={<AssistantDashboard />} />
              <Route path="auditoires" element={<AssistantAuditoriums />} />
              <Route path="auditoires/:code" element={<AssistantAuditoriumDetails />} />
              <Route path="auditoires/:code/message" element={<AssistantAuditoriumMessage />} />
              <Route path="messages" element={<AssistantMessages />} /> {/* New route */}
              <Route path="auditoires/:code/tptd/new" element={<AssistantNewTPTD />} />
              <Route path="auditoires/:code/quizzes/new" element={<AssistantNewQuiz />} />
              <Route path="students/:studentId" element={<AssistantStudentProfile />} /> {/* New dynamic route */}
              <Route path="notes" element={<AssistantGrades />} />
              <Route path="tptd" element={<AssistantTPTD />} />
              <Route path="quizzes" element={<AssistantQuizzes />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="a-corriger" element={<AssistantToGrade />} />
              <Route path="profil" element={<AssistantProfile />} />
            </Route>
          </Route>

          {/* Routes pour les autres rôles (Admin, etc.) */}
          <Route path="/pdg" element={<RoleRoute allowedRoles={['pdg']} />}> 
            <Route index element={<PDGDashboard />} />
          </Route>
          <Route path="/dg" element={<RoleRoute allowedRoles={['directeur_general']} />}> 
            <Route index element={<DgDashboard />} />
          </Route>
          <Route path="/sga" element={<RoleRoute allowedRoles={['sga']} />}> 
            <Route index element={<SgaDashboard />} />
          </Route>
          <Route path="/sgad" element={<RoleRoute allowedRoles={['sgad']} />}> 
            <Route index element={<SgadDashboard />} />
          </Route>
          <Route path="/section" element={<RoleRoute allowedRoles={['chef_section']} />}> 
            <Route index element={<SectionDashboard />} />
          </Route>
          <Route path="/departement" element={<RoleRoute allowedRoles={['chef_departement']} />}> 
            <Route index element={<DepartementDashboard />} />
          </Route>
          <Route path="/jury" element={<RoleRoute allowedRoles={['jury']} />}> 
            <Route index element={<JuryDashboard />} />
          </Route>
          <Route path="/apparitorat" element={<RoleRoute allowedRoles={['apparitorat']} />}> 
            <Route index element={<ApparitoratDashboard />} />
          </Route>
          <Route path="/caisse" element={<RoleRoute allowedRoles={['caisse']} />}> 
            <Route index element={<CaisseDashboard />} />
          </Route>
          <Route path="/it" element={<RoleRoute allowedRoles={['service_it']} />}> 
            <Route index element={<ITDashboard />} />
          </Route>
          <Route path="/bibliotheque" element={<RoleRoute allowedRoles={['bibliothecaire']} />}> 
            <Route index element={<BibliothequeDashboard />} />
          </Route>

        </Route>
      </Route>

      {/* Redirection pour toute autre URL non trouvée */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
