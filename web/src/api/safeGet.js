import axios from 'axios'

export async function safeGet(url, fallback = null) {
  try {
    const { data } = await axios.get(url)
    return data
  } catch (e) {
    // 404/500 -> retourner une valeur par défaut pour éviter les erreurs non catchées
    return fallback
  }
}
