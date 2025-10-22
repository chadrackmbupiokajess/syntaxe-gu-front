import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit'
import axios from 'axios'

const accessKey = 'access_token'
const refreshKey = 'refresh_token'

// Hypothèse endpoints Django (ajustez si nécessaire)
// POST /api/auth/token/ -> {access, refresh, user}
export const loginThunk = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/token/', { username, password })
    return data
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Erreur de connexion' })
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/api/auth/me/')
    return data
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Erreur profil' })
  }
})

const slice = createSlice({
  name: 'auth',
  initialState: {
    access: localStorage.getItem(accessKey) || null,
    refresh: localStorage.getItem(refreshKey) || null,
    me: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.access = null
      state.refresh = null
      state.me = null
      localStorage.removeItem(accessKey)
      localStorage.removeItem(refreshKey)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => { state.status = 'loading'; state.error = null })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.access = action.payload.access
        state.refresh = action.payload.refresh
        localStorage.setItem(accessKey, action.payload.access)
        localStorage.setItem(refreshKey, action.payload.refresh)
      })
      .addCase(loginThunk.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload })
      .addCase(fetchMe.fulfilled, (state, action) => { state.me = action.payload })
  }
})

export const { logout } = slice.actions

const store = configureStore({ reducer: { auth: slice.reducer } })
export default store
