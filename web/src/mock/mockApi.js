import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const ROLES = [
  'pdg', 'directeur_general', 'sga', 'sgad',
  'chef_section', 'chef_departement', 'enseignant', 'assistant',
  'apparitorat', 'caisse', 'service_it', 'etudiant', 'bibliothecaire', 'jury'
]

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const ROLES_KEY = 'mock_roles'

function getSelectedRoles() {
  try {
    const val = localStorage.getItem(ROLES_KEY)
    if (!val) return ['etudiant']
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) && parsed.length ? parsed : ['etudiant']
  } catch {
    return ['etudiant']
  }
}

export function setSelectedRoles(roles) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
}

export function initMock() {
  const mock = new MockAdapter(axios, { delayResponse: 300 })

  // In-memory mock state
  let quizIdSeq = 3
  let attemptIdSeq = 1
  let tptdIdSeq = 3
  let submissionIdSeq = 1
  const quizzesAvailable = [
    { id: 1, title: 'Algorithmique - Chapitre 5', duration: 20, deadline: '2025-11-20T18:00:00Z' },
    { id: 2, title: 'Bases de donnees - Normalisation', duration: 30, deadline: '2025-11-25T18:00:00Z' },
  ]
  const myAttempts = []
  const tptdAvailable = [
    { id: 1, title: 'TP Reseaux: sockets', type: 'TP', deadline: '2025-11-15T23:59:59Z' },
    { id: 2, title: 'TD POO: UML', type: 'TD', deadline: '2025-11-18T23:59:59Z' },
  ]
  const mySubmissions = []
  const assistantNotifications = []

  // Auth: token
  mock.onPost('/api/auth/token/').reply(config => {
    const { username } = JSON.parse(config.data || '{}')
    const access = 'mock-access-token-' + Date.now()
    const refresh = 'mock-refresh-token-' + Date.now()
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    return [200, { access, refresh, user: username || 'admin' }]
  })

  // Auth: me
  mock.onGet('/api/auth/me/').reply(() => {
    const roles = getSelectedRoles()
    return [200, {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      is_superuser: false,
      roles,
      all_roles: ROLES,
    }]
  })

  // Health
  mock.onGet('/api/health/').reply(200, { status: 'ok', mock: true })

  // Étudiant: Quiz
  mock.onGet('/api/quizzes/student/available/').reply(200, quizzesAvailable)

  mock.onPost(/\/api\/quizzes\/student\/(\d+)\/start\//).reply(config => {
    const m = config.url.match(/student\/(\d+)\/start\//)
    const quizId = Number(m[1])
    const quiz = quizzesAvailable.find(q => q.id === quizId)
    if (!quiz) return [404, { detail: 'Quiz introuvable' }]
    const attempt = { id: attemptIdSeq++, quiz: { id: quiz.id, title: quiz.title }, started_at: new Date().toISOString(), submitted_at: null, score: null, is_fully_graded: false }
    myAttempts.push(attempt)
    return [200, attempt]
  })

  mock.onPost(/\/api\/quizzes\/student\/attempts\/(\d+)\/submit\//).reply(config => {
    const m = config.url.match(/attempts\/(\d+)\/submit\//)
    const attemptId = Number(m[1])
    const attempt = myAttempts.find(a => a.id === attemptId)
    if (!attempt) return [404, { detail: 'Tentative introuvable' }]
    attempt.submitted_at = new Date().toISOString()
    // Auto-grade simplifiée
    attempt.score = Math.floor(50 + Math.random() * 50)
    attempt.is_fully_graded = true
    assistantNotifications.unshift({ id: 'nq-' + Date.now(), type: 'quiz', text: `Soumission Quiz: ${attempt.quiz?.title || 'Quiz'}`, at: new Date().toLocaleString() })
    return [200, attempt]
  })

  mock.onGet('/api/quizzes/student/my-attempts/').reply(200, myAttempts)

  // Étudiant: TP/TD
  mock.onGet('/api/tptd/student/available/').reply(200, tptdAvailable)

  mock.onPost(/\/api\/tptd\/student\/(\d+)\/submit\//).reply(config => {
    const m = config.url.match(/student\/(\d+)\/submit\//)
    const assignId = Number(m[1])
    const assign = tptdAvailable.find(t => t.id === assignId)
    if (!assign) return [404, { detail: 'Devoir introuvable' }]
    const body = JSON.parse(config.data || '{}')
    const sub = { id: submissionIdSeq++, assignment_id: assign.id, title: assign.title, submitted_at: new Date().toISOString(), content: body.content || '', grade: null, feedback: null, status: 'submitted' }
    mySubmissions.push(sub)
    assistantNotifications.unshift({ id: 'nt-' + Date.now(), type: 'tptd', text: `Soumission TP/TD: ${assign.title}`, at: new Date().toLocaleString() })
    return [200, sub]
  })

  mock.onGet('/api/tptd/student/my-submissions/').reply(200, mySubmissions)
  // Notifications Assistant
  mock.onGet('/api/assistant/notifications').reply(200, assistantNotifications)

  // Example academics endpoints (read-only mock)
  mock.onGet(/\/api\/academics\/faculties\/?$/).reply(200, [
    { id: 1, code: 'SCI', name: 'Sciences' },
    { id: 2, code: 'LET', name: 'Lettres' },
  ])

  // Role-specific summaries
  mock.onGet('/api/student/summary').reply(200, {
    name: 'John Doe',
    program: 'Licence Informatique',
    semester: 'S5',
    gpa: 3.4,
    pendingAssignments: 2,
    upcomingQuizzes: 1,
    creditsEarned: 120,
    nextEvents: [
      { title: 'Quiz Algorithmique', date: '2025-11-05' },
      { title: 'TP Réseaux', date: '2025-11-07' },
    ],
  })

  // Profil étudiant
  mock.onGet('/api/student/profile').reply(200, {
    name: 'John Doe',
    matricule: '2021-12345',
    email: 'john.doe@uni.test',
    phone: '+243 000 000 000',
    address: 'Campus Nord, Avenue Université',
    auditorium: 'L3-INFO-A',
    session: '2024-2025 S1',
    department: 'Informatique',
    faculty: 'Sciences',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe'
  })

  // Étudiant: métadonnées & notes récentes
  mock.onGet('/api/student/meta').reply(200, {
    auditorium: 'L3-INFO-A',
    session: '2024-2025 S1',
    department: 'Informatique',
    faculty: 'Sciences',
    matricule: '2021-12345',
    email: 'john.doe@uni.test'
  })

  mock.onGet('/api/student/grades/recent').reply(200, [
    { course: 'Algo', grade: 14 },
    { course: 'BD', grade: 13 },
    { course: 'Réseaux', grade: 15 },
    { course: 'POO', grade: 16 },
    { course: 'Systèmes', grade: 12 },
  ])

  // Étudiant: toutes les notes (par cours avec crédits)
  const gradesAll = [
    { code: 'ALGO301', title: 'Algorithmique', credits: 5, grade: 14 },
    { code: 'BD202', title: 'Bases de données', credits: 4, grade: 13 },
    { code: 'RES304', title: 'Réseaux', credits: 4, grade: 15 },
    { code: 'POO205', title: 'Programmation OO', credits: 5, grade: 16 },
    { code: 'SYS210', title: 'Systèmes', credits: 3, grade: 12 },
  ]
  mock.onGet('/api/student/grades/all').reply(200, gradesAll)

  // Étudiant: cours (avec crédits)
  const studentCourses = [
    { code: 'ALGO301', title: 'Algorithmique', credits: 5, instructor: 'Pr. Martin' },
    { code: 'BD202', title: 'Bases de données', credits: 4, instructor: 'Dr. Diallo' },
    { code: 'RES304', title: 'Réseaux', credits: 4, instructor: 'Mme. Nsimba' },
    { code: 'POO205', title: 'Programmation OO', credits: 5, instructor: 'M. Laurent' },
  ]
  mock.onGet('/api/student/courses').reply(200, studentCourses)

  // Chat par cours
  const chats = {
    ALGO301: [ { id: 1, user: 'demo', text: 'Bonjour, le quiz porte sur quels chapitres ?', at: new Date().toISOString() } ],
    BD202: [], RES304: [], POO205: []
  }
  mock.onGet(/\/api\/student\/chat\/([A-Z0-9]+)\/messages/).reply(config => {
    const m = config.url.match(/chat\/([A-Z0-9]+)\/messages/)
    const code = m[1]
    return [200, chats[code] || []]
  })
  mock.onPost(/\/api\/student\/chat\/([A-Z0-9]+)\/messages/).reply(config => {
    const m = config.url.match(/chat\/([A-Z0-9]+)\/messages/)
    const code = m[1]
    const body = JSON.parse(config.data || '{}')
    const arr = chats[code] ||= []
    arr.push({ id: arr.length + 1, user: 'demo', text: body.text || '', at: new Date().toISOString() })
    return [200, arr[arr.length - 1]]
  })

  // Notifications
  mock.onGet('/api/student/notifications').reply(200, [
    { id: 1, type: 'tptd', text: 'Nouveau TP Réseaux publié', at: '2025-11-02 10:30' },
    { id: 2, type: 'quiz', text: 'Quiz Algo vendredi 14:00', at: '2025-11-03 09:10' },
    { id: 3, type: 'finance', text: 'Rappel: frais académiques avant le 15', at: '2025-11-03 08:00' },
    { id: 4, type: 'exam', text: 'Calendrier des examens disponible', at: '2025-11-04 12:00' },
  ])

  // Calendrier académique
  mock.onGet('/api/student/calendar').reply(200, [
    { date: '2025-11-05', title: 'Quiz Algorithmique' },
    { date: '2025-11-07', title: 'TP Réseaux' },
    { date: '2025-11-12', title: 'TD POO' },
    { date: '2025-11-20', title: 'Date limite frais académiques' },
  ])

  // Bibliothèque (vue étudiante)
  mock.onGet('/api/library/catalog').reply(200, [
    { id: 1, title: 'Structures de données', author: 'N. Wirth', isbn: '978-0-12-345678-9' },
    { id: 2, title: 'Réseaux informatiques', author: 'A. Tanenbaum', isbn: '978-0-98-765432-1' },
  ])
  mock.onGet('/api/library/myloans').reply(200, [
    { id: 10, title: 'POO en Java', due: '2025-11-25', status: 'loan' },
  ])

  // Paiements
  mock.onGet('/api/payments/mine').reply(200, [
    { id: 1001, label: 'Frais académiques S1', amount: 250000, status: 'pending', due: '2025-11-15' },
    { id: 1002, label: 'Carte étudiante', amount: 10000, status: 'paid', paid_at: '2025-10-10' },
  ])

  // Documents (attestations / inscriptions / relevé)
  mock.onGet('/api/student/documents').reply(200, [
    { id: 1, type: 'attestation', label: 'Attestation de scolarité 2024-2025', date: '2025-10-01', status: 'ready', url: '/mock/attestation.pdf' },
    { id: 2, type: 'inscription', label: 'Fiche d\'inscription S1 2024-2025', date: '2024-09-15', status: 'ready', url: '/mock/inscription.pdf' },
    { id: 3, type: 'releve', label: 'Relevé de notes S5', date: '2025-02-10', status: 'processing' },
  ])

  mock.onGet('/api/assistant/summary').reply(200, {
    courses: 3,
    activeTPTD: 4,
    activeQuizzes: 2,
    toGrade: 18,
    auditoriums: [
      { code: 'L3-INFO-A', students: 62 },
      { code: 'L2-INFO-B', students: 58 },
    ],
  })

  // Assistant: mes auditoires
  const myAuditoriums = [
    { code: 'L3-INFO-A', name: 'L3 Info A', students: 62 },
    { code: 'L2-INFO-B', name: 'L2 Info B', students: 58 },
  ]
  mock.onGet('/api/auditoriums/assistant/my/').reply(200, myAuditoriums)

  // Enseignant/Assistant profil
  mock.onGet('/api/teacher/profile').reply(200, {
    name: 'Dr. Jane Smith',
    email: 'jane.smith@uni.test',
    phone: '+243 111 222 333',
    department: 'Informatique',
    faculty: 'Sciences',
    office: 'Bureau B-204',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith'
  })

  // Assistant: TP/TD
  let tptdSeq = 3
  const tptdMy = [
    { id: 1, title: 'TP Réseaux: sockets', type: 'TP', course_code: 'RES304', auditorium: 'L3-INFO-A', deadline: '2025-11-15T23:59:59Z', description: 'Implémentez un écho serveur', status: 'open' },
    { id: 2, title: 'TD POO: UML', type: 'TD', course_code: 'POO205', auditorium: 'L2-INFO-B', deadline: '2025-11-18T23:59:59Z', description: 'Diagrammes de classes', status: 'open' },
  ]
  mock.onGet('/api/tptd/my/').reply(200, tptdMy)
  mock.onPost('/api/tptd/my/').reply(config => {
    const body = JSON.parse(config.data||'{}')
    const item = { id: tptdSeq++, status: 'open', ...body }
    tptdMy.push(item)
    return [200, item]
  })
  mock.onDelete(/\/api\/tptd\/my\/(\d+)\//).reply(config => {
    const m = config.url.match(/my\/(\d+)\//)
    const id = Number(m[1])
    const idx = tptdMy.findIndex(x=>x.id===id)
    if (idx>=0) tptdMy.splice(idx,1)
    return [204]
  })

  // Assistant: Quiz
  let quizSeq = 3
  const quizzesMy = [
    { id: 1, title: 'Quiz Algo Chap 5', course_code: 'ALGO301', auditorium: 'L3-INFO-A', duration: 20, status: 'open' },
    { id: 2, title: 'Quiz BD Normalisation', course_code: 'BD202', auditorium: 'L2-INFO-B', duration: 30, status: 'open' },
  ]
  mock.onGet('/api/quizzes/my/').reply(200, quizzesMy)
  mock.onPost('/api/quizzes/my/').reply(config => {
    const body = JSON.parse(config.data||'{}')
    const item = { id: quizSeq++, status: 'open', ...body }
    quizzesMy.push(item)
    return [200, item]
  })
  mock.onDelete(/\/api\/quizzes\/my\/(\d+)\//).reply(config => {
    const m = config.url.match(/my\/(\d+)\//)
    const id = Number(m[1])
    const idx = quizzesMy.findIndex(x=>x.id===id)
    if (idx>=0) quizzesMy.splice(idx,1)
    return [204]
  })

  // Assistant: A corriger (file)
  const toGrade = [
    { id: 't-1', kind: 'TP', title: 'TP Réseaux - Alice', course_code: 'RES304', auditorium: 'L3-INFO-A', submitted_at: '2025-11-04 10:00' },
    { id: 'q-1', kind: 'Quiz', title: 'Quiz Algo - Bob', course_code: 'ALGO301', auditorium: 'L3-INFO-A', submitted_at: '2025-11-04 11:20' },
  ]
  mock.onGet('/api/assistant/tograde').reply(200, toGrade)

  // Assistant: cours par auditoire
  const auditoriumCourses = {
    'L3-INFO-A': [ { code: 'ALGO301', title: 'Algorithmique' }, { code: 'RES304', title: 'Réseaux' } ],
    'L2-INFO-B': [ { code: 'BD202', title: 'Bases de données' }, { code: 'POO205', title: 'Programmation OO' } ],
  }
  mock.onGet(/\/api\/assistant\/auditoriums\/(.+)\/courses/).reply(config => {
    const m = config.url.match(/auditoriums\/(.+)\/courses/)
    const code = decodeURIComponent(m[1])
    return [200, auditoriumCourses[code] || []]
  })

  // Assistant: étudiants par auditoire
  const auditoriumStudents = {
    'L3-INFO-A': [
      { id: 's1', name: 'Alice K.' }, { id: 's2', name: 'Bob L.' }, { id: 's3', name: 'Charlie M.' }
    ],
    'L2-INFO-B': [
      { id: 's4', name: 'Diane N.' }, { id: 's5', name: 'Ethan O.' }
    ]
  }
  mock.onGet(/\/api\/assistant\/auditoriums\/(.+)\/students/).reply(config => {
    const m = config.url.match(/auditoriums\/(.+)\/students/)
    const code = decodeURIComponent(m[1])
    return [200, auditoriumStudents[code] || []]
  })

  // Assistant: notes par auditoire + cours
  const gradesStore = {
    'L3-INFO-A|ALGO301': { s1: 14, s2: 12, s3: 16 },
    'L3-INFO-A|RES304': { s1: 13, s2: 15, s3: 11 },
    'L2-INFO-B|BD202': { s4: 12, s5: 17 },
    'L2-INFO-B|POO205': { s4: 14, s5: 15 },
  }
  mock.onGet(/\/api\/assistant\/grades\/(.+)\/(.+)$/).reply(config => {
    const m = config.url.match(/grades\/(.+)\/(.+)$/)
    const auditorium = decodeURIComponent(m[1])
    const course = decodeURIComponent(m[2])
    const key = `${auditorium}|${course}`
    const students = auditoriumStudents[auditorium] || []
    const grades = gradesStore[key] || {}
    const result = students.map(s => ({ student_id: s.id, name: s.name, grade: grades[s.id] ?? null }))
    return [200, result]
  })
  mock.onPatch(/\/api\/assistant\/grades\/(.+)\/(.+)$/).reply(config => {
    const m = config.url.match(/grades\/(.+)\/(.+)$/)
    const auditorium = decodeURIComponent(m[1])
    const course = decodeURIComponent(m[2])
    const key = `${auditorium}|${course}`
    const body = JSON.parse(config.data||'{}') // { student_id, grade }
    gradesStore[key] = gradesStore[key] || {}
    gradesStore[key][body.student_id] = body.grade
    return [200, { ok: true }]
  })

  mock.onGet('/api/teacher/summary').reply(200, {
    courses: 2,
    publications: 12,
    discussions: 5,
    toPublishGrades: 3,
  })

  mock.onGet('/api/finance/summary').reply(200, {
    paymentsToday: 42,
    totalToday: 1250000,
    pendingInvoices: 17,
    refunds: 2,
  })
  // Caisse: opérations du jour
  mock.onGet('/api/finance/operations').reply(200, [
    { id: 'OP-2001', date: '2025-11-04', type: 'Encaissement', montant: 250000, statut: 'ok' },
    { id: 'OP-2002', date: '2025-11-04', type: 'Remboursement', montant: 10000, statut: 'ok' },
  ])

  mock.onGet('/api/library/summary').reply(200, {
    loansActive: 128,
    overdue: 9,
    catalog: 8421,
    reservations: 23,
  })
  // Bibliothèque (gestion): réservations
  mock.onGet('/api/library/gestion/reservations').reply(200, [
    { id: 'RES-1', titre: 'Réseaux informatiques', lecteur: 'Ethan O.', statut: 'en attente' },
    { id: 'RES-2', titre: 'Structures de données', lecteur: 'Alice K.', statut: 'confirmée' },
  ])

  mock.onGet('/api/pdg/summary').reply(200, {
    students: 5240,
    staff: 410,
    revenueYTD: 120000000,
    satisfaction: 87,
  })
  // PDG: activités stratégiques
  const pdgActivities = [
    { id: 1, date: '2025-11-10', type: 'Conseil', intitule: 'Conseil d’administration trimestriel', statut: 'planifié' },
    { id: 2, date: '2025-11-12', type: 'Budget', intitule: 'Révision budget 2025', statut: 'en cours' },
    { id: 3, date: '2025-11-15', type: 'Partenariat', intitule: 'Signature MoU avec Entreprise X', statut: 'terminé' },
  ]
  mock.onGet('/api/pdg/activities').reply(200, pdgActivities)
  // DG: résumé et actions
  mock.onGet('/api/dg/summary').reply(200, {
    decisionsPending: 5,
    projects: 12,
    budgetUsed: 68,
    satisfaction: 84,
  })
  mock.onGet('/api/dg/actions').reply(200, [
    { id: 'ACT-1', date: '2025-11-03', domaine: 'Infrastructures', action: 'Validation maintenance serveurs', statut: 'effectué' },
    { id: 'ACT-2', date: '2025-11-04', domaine: 'Pédagogie', action: 'Approbation calendrier examens', statut: 'en cours' },
  ])

  mock.onGet('/api/it/summary').reply(200, {
    incidentsOpen: 6,
    deployments: 2,
    uptime: 99.98,
  })
  // IT: incidents
  mock.onGet('/api/it/incidents').reply(200, [
    { id: 'INC-101', date: '2025-11-04', service: 'WiFi Campus', priorite: 'haute', statut: 'ouvert' },
    { id: 'INC-102', date: '2025-11-03', service: 'Intranet', priorite: 'moyenne', statut: 'résolu' },
  ])

  mock.onGet('/api/department/summary').reply(200, {
    departments: 6,
    courses: 84,
    auditoriums: 22,
  })
  mock.onGet('/api/department/list').reply(200, [
    { code: 'INFO', intitule: 'Informatique', chefs: 2 },
    { code: 'GEST', intitule: 'Gestion', chefs: 1 },
  ])

  mock.onGet('/api/section/summary').reply(200, {
    sections: 3,
    heads: 3,
    kpis: { fillRate: 92 },
  })
  mock.onGet('/api/section/list').reply(200, [
    { code: 'L1', intitule: 'Licence 1', effectif: 420 },
    { code: 'L2', intitule: 'Licence 2', effectif: 380 },
    { code: 'L3', intitule: 'Licence 3', effectif: 360 },
  ])

  mock.onGet('/api/jury/summary').reply(200, {
    defensesUpcoming: 7,
    reportsPending: 11,
  })
  mock.onGet('/api/jury/defenses').reply(200, [
    { id: 'DEF-01', etudiant: 'Alice K.', sujet: 'IA et Santé', date: '2025-11-20', jury: 'J1' },
    { id: 'DEF-02', etudiant: 'Bob L.', sujet: 'Blockchain et Logistique', date: '2025-11-22', jury: 'J2' },
  ])

  mock.onGet('/api/apparitorat/summary').reply(200, {
    attendanceToday: 86,
    incidents: 1,
  })
  mock.onGet('/api/apparitorat/presences').reply(200, [
    { id: 1, date: '2025-11-04', auditoire: 'L3-INFO-A', present: 58, total: 62 },
    { id: 2, date: '2025-11-04', auditoire: 'L2-INFO-B', present: 52, total: 58 },
  ])

  mock.onGet('/api/sga/summary').reply(200, {
    enrollmentsPending: 14,
    auditoriumsManaged: 12,
  })
  mock.onGet('/api/sga/demandes').reply(200, [
    { id: 'DEM-1', type: 'Inscription', etudiant: 'Chris M.', statut: 'en attente' },
    { id: 'DEM-2', type: 'Transfert', etudiant: 'Diane N.', statut: 'validé' },
  ])

  mock.onGet('/api/sgad/summary').reply(200, {
    payrollActions: 3,
    financeReports: 5,
  })
  mock.onGet('/api/sgad/paie').reply(200, [
    { id: 'PAY-100', agent: 'Martin', mois: '2025-10', statut: 'traité' },
    { id: 'PAY-101', agent: 'Nadia', mois: '2025-10', statut: 'en cours' },
  ])

  return mock
}

export const ALL_ROLES = ROLES
