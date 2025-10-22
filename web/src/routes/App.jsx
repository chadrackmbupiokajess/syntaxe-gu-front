import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../screens/Login'
import RoleLanding from '../screens/RoleLanding'
import ProtectedRoute from '../shared/ProtectedRoute'
import RoleRoute from '../shared/RoleRoute'
import Layout from '../components/Layout'
import PDGDashboard from '../screens/PDGDashboard'

// Modules Admin
import DgDashboard from '../screens/DgDashboard'
import SgaDashboard from '../screens/SgaDashboard'
import SgadDashboard from '../screens/SgadDashboard'
import SectionDashboard from '../screens/SectionDashboard'
import DepartementDashboard from '../screens/DepartementDashboard'
import JuryDashboard from '../screens/JuryDashboard'
import ApparitoratDashboard from '../screens/ApparitoratDashboard'
import CaisseDashboard from '../screens/CaisseDashboard'
import ITDashboard from '../screens/ITDashboard'
import BibliothequeDashboard from '../screens/BibliothequeDashboard'

// Etudiant
import StudentLayout from '../components/StudentLayout'
import StudentDashboard from '../screens/StudentDashboard'
import StudentWork from '../screens/StudentWork'
import StudentCourses from '../screens/StudentCourses'
import StudentChat from '../screens/StudentChat'
import StudentNotifications from '../screens/StudentNotifications'
import StudentCalendar from '../screens/StudentCalendar'
import StudentLibrary from '../screens/StudentLibrary'
import StudentPayments from '../screens/StudentPayments'
import StudentNotes from '../screens/StudentNotes'
import StudentDocuments from '../screens/StudentDocuments'
import StudentProfile from '../screens/StudentProfile'

// Assistant/Enseignant
import AssistantLayout from '../components/AssistantLayout'
import AssistantDashboard from '../screens/AssistantDashboard'
import AssistantAuditoriums from '../screens/AssistantAuditoriums'
import AssistantGrades from '../screens/AssistantGrades'
import AssistantTPTD from '../screens/AssistantTPTD'
import AssistantQuizzes from '../screens/AssistantQuizzes'
import AssistantToGrade from '../screens/AssistantToGrade'
import AssistantProfile from '../screens/AssistantProfile'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleLanding />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Assistant/Enseignant */}
      <Route
        path="/assistant"
        element={
          <RoleRoute roles={["assistant", "enseignant"]}>
            <Layout>
              <AssistantLayout />
            </Layout>
          </RoleRoute>
        }
      >
        <Route index element={<AssistantDashboard/>} />
        <Route path="auditoires" element={<AssistantAuditoriums/>} />
        <Route path="notes" element={<AssistantGrades/>} />
        <Route path="tptd" element={<AssistantTPTD/>} />
        <Route path="quizzes" element={<AssistantQuizzes/>} />
        <Route path="notifications" element={<StudentNotifications/>} />
        <Route path="a-corriger" element={<AssistantToGrade/>} />
        <Route path="profil" element={<AssistantProfile/>} />
      </Route>

      {/* Etudiant */}
      <Route
        path="/etudiant"
        element={
          <RoleRoute roles={["etudiant"]}>
            <Layout>
              <StudentLayout />
            </Layout>
          </RoleRoute>
        }
      >
        <Route index element={<StudentDashboard/>} />
        <Route path="travaux" element={<StudentWork/>} />
        <Route path="cours" element={<StudentCourses/>} />
        <Route path="chat" element={<StudentChat/>} />
        <Route path="notifications" element={<StudentNotifications/>} />
        <Route path="calendrier" element={<StudentCalendar/>} />
        <Route path="bibliotheque" element={<StudentLibrary/>} />
        <Route path="profil" element={<StudentProfile/>} />
        <Route path="notes" element={<StudentNotes/>} />
        <Route path="documents" element={<StudentDocuments/>} />
        <Route path="paiements" element={<StudentPayments/>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />

      {/* PDG */}
      <Route
        path="/pdg"
        element={
          <RoleRoute roles={["pdg"]}>
            <Layout>
              <PDGDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Directeur Général */}
      <Route
        path="/dg"
        element={
          <RoleRoute roles={["directeur_general"]}>
            <Layout>
              <DgDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* SGA */}
      <Route
        path="/sga"
        element={
          <RoleRoute roles={["sga"]}>
            <Layout>
              <SgaDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* SGAD */}
      <Route
        path="/sgad"
        element={
          <RoleRoute roles={["sgad"]}>
            <Layout>
              <SgadDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Section */}
      <Route
        path="/section"
        element={
          <RoleRoute roles={["chef_section"]}>
            <Layout>
              <SectionDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Département */}
      <Route
        path="/departement"
        element={
          <RoleRoute roles={["chef_departement"]}>
            <Layout>
              <DepartementDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Jury */}
      <Route
        path="/jury"
        element={
          <RoleRoute roles={["jury"]}>
            <Layout>
              <JuryDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Apparitorat */}
      <Route
        path="/apparitorat"
        element={
          <RoleRoute roles={["apparitorat"]}>
            <Layout>
              <ApparitoratDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Caisse */}
      <Route
        path="/caisse"
        element={
          <RoleRoute roles={["caisse"]}>
            <Layout>
              <CaisseDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* IT */}
      <Route
        path="/it"
        element={
          <RoleRoute roles={["service_it"]}>
            <Layout>
              <ITDashboard />
            </Layout>
          </RoleRoute>
        }
      />

      {/* Bibliothèque */}
      <Route
        path="/bibliotheque"
        element={
          <RoleRoute roles={["bibliothecaire"]}>
            <Layout>
              <BibliothequeDashboard />
            </Layout>
          </RoleRoute>
        }
      />
    </Routes>
  )
}
