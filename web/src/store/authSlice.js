import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';
// On importe notre client Axios configuré, pas l'axios de base
import apiClient from '../api/axiosConfig';

const accessKey = 'access_token';
const refreshKey = 'refresh_token';

export const loginThunk = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    // On utilise apiClient, qui a déjà la bonne baseURL
    const { data } = await apiClient.post('/auth/login/', { username, password });
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Erreur de connexion' });
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    // On utilise apiClient, qui ajoutera automatiquement le token d'authentification
    const { data } = await apiClient.get('/auth/me/');
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Erreur profil' });
  }
});

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
      state.access = null;
      state.refresh = null;
      state.me = null;
      localStorage.removeItem(accessKey);
      localStorage.removeItem(refreshKey);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => { state.status = 'loading'; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        localStorage.setItem(accessKey, action.payload.access);
        localStorage.setItem(refreshKey, action.payload.refresh);
      })
      .addCase(loginThunk.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchMe.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.status = 'succeeded'; state.me = action.payload; })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        // Si fetchMe échoue, c'est que le token est probablement invalide. On déconnecte.
        state.access = null;
        state.refresh = null;
        state.me = null;
        localStorage.removeItem(accessKey);
        localStorage.removeItem(refreshKey);
      });
  }
});

export const { logout } = slice.actions;

// Note: La configuration du store est généralement dans un fichier séparé (store.js)
// mais on la laisse ici si c'est votre structure actuelle.
const store = configureStore({ reducer: { auth: slice.reducer } });
export default store;
