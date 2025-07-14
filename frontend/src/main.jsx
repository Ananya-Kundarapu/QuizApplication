import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './Context/AuthContext'; // ✅ import context provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ wrap the entire app */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
