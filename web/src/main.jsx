import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './routes/App';
import store from './store/authSlice';
import { fetchMe } from './store/authSlice'; // Importer fetchMe
import './index.css';
import { ToastProvider } from './shared/ToastProvider';
import './api/configAxios'; // Assurez-vous que ce fichier configure bien la base URL d'axios

// --- Logique de chargement initial de l'utilisateur ---
const accessToken = localStorage.getItem('access_token');
if (accessToken) {
  // Si un token existe, on essaie de récupérer les infos de l'utilisateur dès le début
  store.dispatch(fetchMe());
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);
