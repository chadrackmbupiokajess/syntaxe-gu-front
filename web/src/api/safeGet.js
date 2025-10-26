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

export async function safePost(url, body, fallback = null) {
    try {
      const { data } = await axios.post(url, body)
      return data
    } catch (e) {
      return fallback
    }
  }
