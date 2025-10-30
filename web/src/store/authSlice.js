import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';
import apiClient from '../api/axiosConfig';

const accessKey = 'access_token';
const refreshKey = 'refresh_token';

// On change 'username' en 'matricule' pour correspondre au backend
export const loginThunk = createAsyncThunk('auth/login', async ({ matricule, password }, { rejectWithValue }) => {
  try {
    // On envoie 'matricule' au lieu de 'username'
    const { data } = await apiClient.post('/accounts/login/', { matricule, password });
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { detail: 'Erreur de connexion' });
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    // Le backend renvoie maintenant le profil unifié avec le rôle
    const { data } = await apiClient.get('/accounts/me/');
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
    me: null, // `me` contiendra toutes les infos utilisateur, y compris le rôle
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
      .addCase(fetchMe.fulfilled, (state, action) => { 
        state.status = 'succeeded'; 
        // L'objet `me` contient maintenant toutes les infos, y compris le rôle
        state.me = action.payload; 
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.access = null;
        state.refresh = null;
        state.me = null;
        localStorage.removeItem(accessKey);
        localStorage.removeItem(refreshKey);
      });
  }
});

export const { logout } = slice.actions;

const store = configureStore({ reducer: { auth: slice.reducer } });
export default store;
