import axios from 'axios'

// Configure l'instance axios globale pour pointer vers le backend Django
// Hypothèse: backend sur http://localhost:8000. Ajustez BASE_URL si besoin.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

axios.defaults.baseURL = BASE_URL
// Si vous utilisez JWT via Authorization: Bearer <token>, laissez à false
// (les cookies/CSRF de Django nécessitent true + config CORS côté serveur)
axios.defaults.withCredentials = false

// Attacher automatiquement le token d'auth si disponible
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token')
    if (token) config.headers = { ...(config.headers||{}), Authorization: `Bearer ${token}` }
  } catch {}
  return config
})

// Optionnel: gestion simplifiée des 401/403
axios.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // token invalide/expiré: on purge et on laisse l'app rediriger
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    return Promise.reject(err)
  }
)

export default axios
