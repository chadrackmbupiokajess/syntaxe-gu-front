Proposition complète pour un site d’université ultra moderne
Voici une vision claire et un plan d’exécution de A à Z. Si tu valides, je démarre l’initialisation du projet (sans coder de logique métier pour l’instant).
Vision et objectifs
Image institutionnelle premium, moderne et accessible (RGAA/WCAG AA)
Un site vitrine puissant + des portails (Étudiants/Enseignants/Administration)
Un CMS intuitif pour les équipes communication et scolarité
Des processus clés digitalisés: admissions, candidatures, inscriptions, paiements, emplois du temps, notes, documents
UX/UI (expérience moderne)
Design system sur-mesure (dark mode, responsive, micro-interactions, animations légères)
Navigation méga-menu, recherche globale unifiée (formations, actualités, personnels, documents)
Pages vitrines haute qualité (Hero vidéo/3D, chiffres clés, témoignages, CTA admissions)
Multilingue (FR/EN et extensible)
Performances Core Web Vitals A (lazy loading, images next-gen, CDN)
Périmètre fonctionnel
Vitrine:
Accueil, Université, Facultés/Écoles, Formations (Licence/Master/Doctorat), Recherche, Admissions, International, Vie étudiante, Entreprises, Actualités, Événements, Annuaire
Blog/Actualités, Agenda, Publications de recherche, Offres d’emploi
Formulaires: contact, demande d’info, prise de rendez-vous
Admissions & Candidatures:
Dossiers en ligne, étapes par cycle (L/M/D), pièces justificatives, paiement frais dossier, suivi statut
Scolarité & Portails:
Étudiants: profil, inscriptions/renouvellement, emploi du temps, notes, attestations, paiements, documents, messagerie
Enseignants: gestion cours, contenus, notes, émargement, annonces
Admin scolarité: cycles d’admission, cohortes, planning, reporting
Annuaire & RH:
Personnels, enseignants-chercheurs, unités de recherche, publications
CMS:
Pages modulaires (WYSIWYG + blocs composables), médias, workflows d’édition, prévisualisation
Intégrations:
SSO (Azure AD / Google / SAML), paiement (Stripe/PayPlug), stockage (S3/MinIO), email (SendGrid), SMS, recherche (OpenSearch ou Postgres FTS)
Architecture technique (moderne, robuste)
Option recommandée (Headless + Front moderne):
Backend: Django 5 + Django REST Framework, Wagtail CMS 6 (headless)
Base de données: PostgreSQL (UUID PK, partitions pour logs si besoin)
Cache/Queue: Redis + Celery (emails, exports, traitements lourds)
Frontend: Next.js 14/15 (React 18), Tailwind CSS, shadcn/ui, i18n, SSR/ISR
Stockage médias: S3/MinIO, signatures sécurisées
Recherche: OpenSearch/Elasticsearch (ou Postgres FTS si simplicité)
Observabilité: Sentry, Prometheus/Grafana, logs structurés
Sécurité: JWT + cookies HttpOnly, permissions fines par rôle, rate limit, CSP, 2FA
Alternative (stack simplifiée):
Django monolith + Templates + HTMX/Alpine + Tailwind
Avantage: moins de pièces; Inconvénient: moins “ultra moderne” côté UX/animations
Modèle de données (principal, extensible)
Auth & profils:
User (custom), Profile (role: étudiant, enseignant, staff), Permission/AuditLog
Organisation:
Faculty, Department, ResearchUnit, StaffMember, Teacher
Formations & scolarité:
Program (Formation), Specialization, Course (UE/EC), CourseSession, ScheduleSlot
Enrollment, Grade, Transcript, Attendance
Admissions:
AdmissionCycle, Application (Candidature), ApplicationStep, DocumentUpload, Fee (paiement dossier)
Finance:
Invoice, Payment, Scholarship (Bourse), TuitionPlan
Contenus & communication:
Page (Wagtail), News, Event, PersonDirectory, Publication, MediaAsset
Support:
Ticket, FAQ, Notification
Techniques:
Webhook, IntegrationConfig, ExportTask
Relations clés:
Program 1–N Course; Course 1–N CourseSession; User 1–N Enrollment; Enrollment 1–N Grade
AdmissionCycle 1–N Application; Application 1–N DocumentUpload; Invoice 1–N Payment
Sécurité, conformité, accessibilité
RGPD: consentements, durée de conservation, purge/anonymisation
Rôles/permissions: Admin, Rédacteur, Scolarité, Enseignant, Étudiant, Candidat, Visiteur
Journaux d’audit, traçabilité des actions sensibles
RGAA/WCAG AA, tests d’accessibilité automatisés
Performance, SEO, analytics
Core Web Vitals A: SSR/ISR, images optimisées, cache CDN (Cloudflare)
SEO: sitemap, robots, schema.org (Organization, Course, Event, Article), breadcrumbs, canoniques
Analytics: Matomo/GA4, événements clés (candidature, inscription, contact)
DevOps & déploiement
Docker Compose (dev) + environnements dev/staging/prod
CI/CD GitHub Actions: tests, lint, migrations, build front, déploiement
TLS, WAF/Cloudflare, sauvegardes automatisées (DB + médias), runbooks
Arborescence de contenu (exemple)
/, /universite, /facultes, /departements, /formations (filtres), /formations/{slug}
/admissions, /candidater, /actualites, /evenements, /recherche, /annuaire
/portail-etudiant, /portail-enseignant, /admin
Plan de livraison (12 semaines, ajustable)
S1: Cadrage, validation architecture, arbres de contenu, KPIs
S2: Design system (tokens, composants, maquettes Home/Formation/Admissions/Portails)
S3: Scaffold (Django, DRF, Wagtail, Next.js), CI/CD, Docker, Postgres/Redis
S4: Auth/SSO, rôles/permissions, modèle de base, i18n
S5: CMS vitrines (pages, actualités, événements, recherche, SEO)
S6: Formations (catalogue, filtres, pages programme, syllabus)
S7–S8: Admissions & candidatures (dossier, workflow, uploads, paiement)
S9: Portail étudiant (inscriptions, documents, emplois du temps, notes)
S10: Portail enseignant (cours, notes, annonces)
S11: QA, performance, accessibilité, sécurité, contenu
S12: Recette, transfert, déploiement, formation équipes
Choix à valider avant de coder
Architecture: Headless (Django+Wagtail+Next.js) ou Monolith Django + HTMX
Moteur de recherche: OpenSearch vs Postgres FTS
Paiement: Stripe/PayPlug
SSO: Azure AD / Google / SAML
Multilingue initial: FR/EN (autres langues à prévoir?)
Proposition de démarrage
Je recommande: Headless (Django 5 + Wagtail 6 + DRF) + Next.js 14/15, Postgres, Redis, Celery, S3, Cloudflare, Sentry.
Étape 1 après validation: initialisation du repo, Docker, skeleton Django/Next.js, base de données, auth personnalisée et Wagtail configuré.


Matrice des rôles et permissions (conforme au cahier des charges)
Je me base uniquement sur le cahier des charges fourni (syntaxe-gu). Ci‑dessous, une modélisation claire des rôles/permissions et un plan d’implémentation RBAC dans Django. Si tu valides, je passe au scaffold (Groupes, permissions custom, seeds, gardes DRF) sans coder de logique métier pour l’instant.
Rôles supportés
pdg
directeur_general
sga
sgad
chef_section
chef_departement
enseignant
assistant
apparitorat
caisse
service_it
etudiant
bibliothecaire
jury
Modules fonctionnels (référence)
Académique: Programmes/Sections/Départements, Cours, Auditoires, Inscriptions, Emplois du temps, Notes
Évaluations: TP/TD, Quiz, Questions, Tentatives, Soumissions
Portails: Étudiant, Assistant, Enseignant
Finance: Factures, Paiements, Reçus, Rapprochements
Bibliothèque: Ouvrages, Exemplaires, Prêts/Retours, Réservations, Amendes, Inventaire
Transverse: Utilisateurs/Rôles, Notifications, Rapports, Disciplinaire/Présence
Codenames de permissions (exemples)
Standards: add/change/delete/view sur chaque modèle (Django)
Custom clés:
validate_enrollment, manage_auditorium_membership
manage_course_assignments (assigner enseignants/assistants)
create_tptd, grade_tptd, publish_tptd_grades, export_tptd_grades
create_quiz, grade_quiz_attempt, publish_quiz_grades, export_quiz_grades
record_attendance, manage_discipline
issue_receipt, reconcile_payments, view_financial_reports
manage_catalog, manage_loans, manage_reservations, manage_inventory, import_export_catalog
evaluate_defense, assign_topics
view_academic_reports, view_global_dashboards
manage_staff, manage_system (IT)
Matrice par rôle (synthèse)
PDG
view_academic_reports, view_financial_reports, view_global_dashboards
Lecture seule globale (view* sur tous les modules)
Directeur général
Lecture globale + change sur paramètres haut niveau (hors opérations fines: pas de grade/publish)
view_academic_reports, view_financial_reports
SGA
change/view: Cours, Auditoires, Inscriptions; validate_enrollment, manage_auditorium_membership
view_academic_reports
SGAD
Finance: issue_receipt, reconcile_payments; view_financial_reports
Gestion personnel admin: manage_staff (portée admin)
Chef de section (portée Section)
change/view: Départements de sa section; créer départements; stats section
view_academic_reports (scope section)
Chef de département (portée Département)
change/view: Cours, Auditoires; manage_course_assignments; plannings
Enseignant (portée Cours/Auditoire assignés)
create_tptd, create_quiz, grade_tptd, grade_quiz_attempt, publish_* (selon politique établissement)
Gérer contenu de cours, forums
Assistant (portée Cours/Auditoire assignés)
create_tptd, create_quiz, grade_tptd, grade_quiz_attempt, publish_; export_; accès « À corriger »
Apparitorat
record_attendance, manage_discipline; view cours/auditoires pertinents
Caisse
issue_receipt, reconcile_payments; view paiements/rapports financiers
Service IT
manage_system, manage_staff, gestion utilisateurs/SSO/paramètres; accès technique global
Étudiant
view: cours/quiz/tptd qui le concernent; submit_tptd, start_quiz, submit_attempt; view_own_grades
Bibliothécaire
manage_catalog, manage_loans, manage_reservations, manage_inventory, import_export_catalog
Jury
evaluate_defense, assign_topics; accès aux dossiers de soutenance/mémoires
Portées (scoping) des permissions
Global: pdg, directeur_general, service_it (principalement)
Section: chef_section
Département: chef_departement
Cours/Auditoire: enseignant, assistant, apparitorat
Individuelle: étudiant (ses propres données), caisse (ses opérations), jury (soutenances assignées)
Plan d’implémentation RBAC dans Django
Groupes = rôles
Créer un Group pour chaque rôle avec slug identique au front (ex: “assistant”, “etudiant”).
Assigner sets de permissions (add/change/delete/view + customs listées).
Permissions custom
Déclarer via Meta permissions sur modèles ou via Permission.add_permission.
Regrouper par app: academics, evaluations, finance, library, core.
Scoping objet
Introduire RoleBinding: user, group, scope_type (section|departement|course|auditorium|null), scope_id.
Enforcer le scope dans:
QuerySets filtrés (managers/services)
Permissions DRF: IsInRoleAndScope (vérifie group + appartenance au scope cible)
Seeds/automation
Management command “seed_roles_permissions”:
crée les Groups
crée/associe les permissions
crée un superuser et quelques RoleBinding d’exemple
Intégration API/Front
DRF: permission classes simples: IsAuthenticated, HasModelPerm, IsRoleIn([…]), IsInRoleAndScope
JWT: inclure roles + scopes (lecture seule côté front; autorité = backend)
Garde front: alignée avec RoleRoute existante
Journalisation et traçabilité
AuditLog sur actions sensibles (publication de notes, validation inscriptions, paiements)
Rate limiting pour endpoints critiques (notes, paiements)
Décisions à valider
Confirmer la liste exacte des permissions custom à créer (celles ci‑dessus te conviennent‑elles ?)
Scoping par RoleBinding (proposé) ou object-permissions type django-guardian
Politique “qui publie les notes” par défaut: enseignant et assistant ou enseignant uniquement
Si tu valides cette matrice et le plan RBAC, je lance:
l’initialisation des Groupes/Permissions,
le modèle RoleBinding,
la commande de seed,
et les classes de permissions DRF de base.