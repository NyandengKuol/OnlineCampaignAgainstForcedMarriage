import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '599912044028-rdl6evgfn4j30gvp2drd12ug0kqdnjfg.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider><App /></AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
