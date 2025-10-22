# Cahier des charges – Portail Universitaire (syntaxe-gu)

## 1. Contexte et objectifs

Le projet vise à fournir un portail universitaire moderne permettant aux différents acteurs (étudiants, assistants, enseignants, personnels administratifs) de gérer les activités académiques et administratives: cours, auditoires, TP/TD, quiz, corrections, notifications, paiements, bibliothèque, etc. L’objectif est d’offrir une expérience fluide, professionnelle et sécurisée, avec un design moderne et un thème sombre optionnel.

## 2. Périmètre fonctionnel

- Authentification et session (JWT côté client via api/client)
- Espace Étudiant: travaux à faire (TP/TD, quiz), soumissions, relevé de notes, tableau de bord
- Espace Assistant: gestion des TP/TD et quiz, correction manuelle et automatisée (partielle), suivi par auditoire, export des corrections
- Cours et auditoires: consultation, affectations, listes d’étudiants
- Notifications, chat de cours (basique), bibliothèque, paiements (pages existantes)
- Tableau de bord général et par rôle

## 3. Rôles et permissions

Références (src/store/slices/authSlice.js):
- pdg, directeur_general, sga, sgad, chef_section, chef_departement, enseignant, assistant, apparitorat, caisse, service_it, etudiant, bibliothecaire, jury

Règles clés mises en œuvre:
- Accès pages étudiant (/student-work, /quiz) réservé au rôle « etudiant » (RoleRoute)
- Assistant: accès à l’espace Assistant pour créer/manager TP/TD/Quiz, corriger, voir les auditoires assignés

### 3.1 Détail par profil utilisateur (fonctions attendues)

- PDG
  - Accès: vision globale (statistiques, rapports financiers et académiques)
  - Actions: décisions stratégiques, lecture seule sur l’ensemble des entités
- Directeur général
  - Accès: ensemble du système (académique + administratif)
  - Actions: gestion académique et administrative de haut niveau
- Secrétariat général académique (SGA)
  - Accès: cours, auditoires, inscriptions, rapports académiques
  - Actions: créer/éditer cours, gérer auditoires, valider inscriptions
- Secrétariat général adjoint (SGAD)
  - Accès: paiements et rapports financiers, gestion du personnel administratif
  - Actions: valider paiements, sortir des rapports, gérer personnels admin
- Chef de section
  - Accès: périmètre section
  - Actions: créer départements, nommer chefs de département, consulter statistiques de section
- Chef de département
  - Accès: périmètre département
  - Actions: créer cours, assigner enseignants/assistants, gérer auditoires, plannings
- Enseignant (Titulaire)
  - Accès: cours assignés, forums, travaux/quiz du cours
  - Actions: gérer contenu de cours, corriger étudiants, animer forums
- Assistant
  - Accès: cours/auditoires assignés, TP/TD/Quiz, corrections
  - Actions: créer/éditer TP/TD/Quiz, corriger manuellement, publier notes, exporter corrections
- Apparitorat
  - Accès: présence, discipline
  - Actions: suivi des présences, traçabilité disciplinaire
- Caisse/Comptabilité
  - Accès: paiements, reçus
  - Actions: encaisser, générer reçus, rapprochements
- Service IT
  - Accès: administration technique
  - Actions: gestion des utilisateurs, maintenance système
- Étudiant
  - Accès: cours, travaux, quiz, notes, forums
  - Actions: soumettre TP/TD, passer des quiz, consulter notes, participer aux discussions
- Bibliothécaire
  - Accès: module Bibliothèque
  - Actions: gestion du catalogue (création/édition/suppression d’ouvrages), gestion des prêts et retours, réservations, sanctions/retards, inventaire, import/export du catalogue
- Jury
  - Accès: modules de soutenance/mémoires
  - Actions: évaluer soutenances, assigner sujets

## 4. Architecture front (React + Redux)

- Outil: Vite, React 18, React-Bootstrap, Redux Toolkit
- Structure (src/):
  - pages/: Home, Dashboard, Courses, CourseDetail, StudentWork, TPTD, Quiz, Assistant, …
  - components/: Layout (Navbar, Sidebar), Auth (ProtectedRoute, RoleRoute), dashboards/* (dont EtudiantDashboard)
  - services/: quizService, tptdService, studentService, assistantService, auditoriumService, coursesService, activityService
  - store/: slices/* (authSlice, assistantSlice, quizSlice, coursesSlice, notificationsSlice, chatSlice) et store.js
  - styles: App.css (thème), index.css (base)

## 5. Spécifications fonctionnelles détaillées

### 5.1 Authentification
- Login: POST /api/auth/login/ → JWT
- Session: GET /api/auth/me/ pour récupérer l’utilisateur courant
- Garde: ProtectedRoute (auth) et RoleRoute (auth + rôle)

### 5.2 Espace Étudiant
- Page StudentWork (src/pages/StudentWork.jsx)
  - Onglets Quiz et TP/TD
  - Chargement des données via studentService:
    - Quiz dispo: GET /api/quizzes/student/available/
    - Démarrage: POST /api/quizzes/student/{quizId}/start/
    - Soumission: POST /api/quizzes/student/attempts/{attemptId}/submit/
    - Mes tentatives: GET /api/quizzes/student/my-attempts/
    - TP/TD dispo: GET /api/tptd/student/available/
    - Soumettre TP/TD: POST /api/tptd/student/{assignmentId}/submit/
    - Mes soumissions: GET /api/tptd/student/my-submissions/
  - Deadlines: affichage compte à rebours, désactivation actions après échéance
  - Quiz Runner: QCU/QCM/Ouverte, sauvegarde locale en mémoire d’état, envoi d’indices numériques côté front
  - TP/TD: modal de soumission (texte ou URL fichier), verrouillage post-deadline
  - Toaster de notifications

### 5.3 Espace Assistant
- Page Assistant (src/pages/Assistant.jsx)
  - Profil assistant (bio, téléphone)
  - Statistiques (auditoires, cours assignés, TP/TD/Quiz actifs, éléments à corriger)
  - Mes Auditoires: affichage enrichi « Nom (Département/Section) », liste d’étudiants, cours par auditoire
  - TP/TD Manager:
    - Liste par cours, création (titre, type, auditoire, cours, deadline, description)
    - Voir soumissions (modal), suppression avec confirmation
    - Statut: Ouvert/Clôturé + compte à rebours
  - Quiz Manager:
    - Création avec questions (QCU/QCM/Ouverte), durée, auditoire, cours
    - Voir tentatives (modal), suppression avec confirmation
  - Corrections:
    - File unifiée « À corriger » (TP/TD et Quiz)
    - Correction TP/TD manuelle (note/20, feedback)
    - Correction Quiz: auto-correction QCU/QCM côté serveur; questions ouvertes: points/feedback par question → finalisation
  - Corrections publiées par auditoire:
    - Filtres: cours, type, dates
    - Tableaux des TP/TD notés et Quiz finalisés
    - Export CSV des corrections filtrées

### 5.4 Cours et Auditoires
- services/auditoriumService.js
  - getMyAssistantAuditoriums(): GET /api/auditoriums/assistant/my/
  - getAllAuditoriums(), getAuditoriumDetail(), gestion cours/assistants/étudiants par auditoire (endpoints dédiés)
- Affichage auditoires: « Nom (Département/Section) » + code, effectif, cours liés

### 5.5 Quiz
- services/quizService.js
  - getMyQuizzes(), createQuiz(), updateQuiz(), deleteQuiz()
  - getQuizAttempts(quizId), gradeQuizAttempt(attemptId)
  - getAllAttempts() (agrégé pour l’assistant)
- Données question: type, énoncé, options A-D, réponses correctes, sample_answer pour correction ouverte, order
- Politique: fenêtre (optionnelle), durée, tentatives; auto-submit et auto-grade par le backend au passage de deadline; is_fully_graded pour marquer la fin de correction

### 5.6 TP/TD
- services/tptdService.js
  - getMyTPTD(), createTPTD(), updateTPTD(), deleteTPTD()
  - getTPTDSubmissions(tptdId), gradeTPTDSubmission(submissionId)
  - getAllSubmissions() (agrégé pour l’assistant)
- Politique: deadline, verrouillage post-date, pas d’auto-correction (correction manuelle avec note/20 + feedback)

### 5.7 Notifications, Chat, Bibliothèque, Paiements
- Pages existantes (Chat.jsx, Library.jsx, Paiements.jsx, etc.) intégrées dans la navigation; extension fonctionnelle possible ultérieurement

### 5.8 Bibliothèque (détails)

- Bibliothécaire
  - Catalogue: CRUD ouvrages (titre, auteurs, ISBN, exemplaires, localisation), import/export CSV/JSON
  - Prêts/Retours: gestion des emprunts par étudiant/enseignant, contrôles de date, retards et amendes
  - Réservations: file d’attente, notifications de disponibilité
  - Inventaire: état des stocks, exemplaires perdus/endommagés, rapports
  - Recherche avancée: titre/auteur/ISBN/mots-clés

- Étudiant/Enseignant
  - Catalogue: recherche et consultation des ouvrages
  - Emprunts: visualiser ses prêts en cours, historique, renouvellements si autorisés
  - Réservations: placer/annuler une réservation, notifications


## 6. Modèle de données (front)

- TP/TD: { id, title, type, course_id/auditorium_id, description, deadline, submissions_count }
- Submission: { id, assignment_id, student{id,…}, file_url, submitted_at, grade, feedback, status }
- Quiz: { id, title, course_id/auditorium_id, duration, questions[], attempts_count }
- Question: { id, type, question_text, option_a..d, correct_answer_qcu, correct_answers_qcm[], sample_answer, order, points? }
- Attempt: { id, quiz{id,…}, student{id,…}, submitted_at, score, is_fully_graded, answers[] }
- Auditoire: { id, name, code, department/section/program, student_count, courses[] }

## 7. UX/UI et thème

- Design moderne, cartes ombrées, badges d’état
- Thème sombre/clair avec bascule dans la Navbar, persistance localStorage
- Accessibilité: contrastes, focus, responsive; tableaux responsives

## 8. Sécurité et contrôle d’accès

- ProtectedRoute (auth requis) et RoleRoute (auth + rôle)
- Étudiant exclusivement pour /student-work et /quiz
- Nettoyage tokens sur logout

## 9. Intégrations API (extraits)

- Quiz (assistant):
  - GET /api/quizzes/my/
  - POST /api/quizzes/my/ (création)
  - PUT/DELETE /api/quizzes/my/{id}/
  - GET /api/quizzes/{quizId}/attempts/
  - PATCH /api/quizzes/attempts/{attemptId}/grade/
- Quiz (étudiant):
  - GET /api/quizzes/student/available/
  - POST /api/quizzes/student/{quizId}/start/
  - POST /api/quizzes/student/attempts/{attemptId}/submit/
  - GET /api/quizzes/student/my-attempts/
- TP/TD (assistant):
  - GET /api/tptd/my/, POST /api/tptd/my/
  - PUT/DELETE /api/tptd/my/{id}/
  - GET /api/tptd/{tptdId}/submissions/
  - PATCH /api/tptd/submissions/{submissionId}/grade/
- TP/TD (étudiant):
  - GET /api/tptd/student/available/
  - POST /api/tptd/student/{assignmentId}/submit/
  - GET /api/tptd/student/my-submissions/
- Auditoires (assistant):
  - GET /api/auditoriums/assistant/my/

## 10. Exigences non fonctionnelles

- Performance: lazy loading par pages, mémoïsation sélective, listes responsives
- Robustesse: gestion des erreurs réseau (toasts), placeholders de chargement
- Accessibilité et responsive: mobiles/tablettes/desktop

## 11. Tests

- Unitaires: reducers, selectors, services (à renforcer)
- E2E: scénarios clés (Assistant crée → Étudiant soumet → Assistant corrige → Étudiant consulte)

## 12. Déploiement

- Build Vite (package.json), CI/CD à prévoir
- Variables d’environnement pour l’API (base URL dans api/client)

## 13. Roadmap (évolutions)

- Étudiant: page « Mes corrections » (filtres + export)
- Assistant: analytics notes par auditoire (moyenne, distribution), export XLSX
- Notifications e-mail en plus des notifications in-app
- Import/export JSON des quiz avancé, banque de questions
- Internationalisation (fr/en)

## 14. Glossaire

- Auditoire: groupe d’étudiants (niveau/section/département)
- TP/TD: Travaux Pratiques / Travaux Dirigés
- QCU/QCM: question à choix unique / multiple

## 15. Annexes et chemins utiles

- Pages principales: src/pages/*
- Services API: src/services/*
- Store/slices Redux: src/store/slices/*
- Thème: src/App.css, src/main.jsx (init thème)
- Garde par rôle: src/components/Auth/RoleRoute.jsx
