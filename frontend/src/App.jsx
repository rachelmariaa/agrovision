import React, { useState } from 'react';
import AppLoader3D from './components/AppLoader3D';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  // Sequence states: 'loading' -> 'auth' (LoginPage) -> 'dashboard' (DashboardPage)
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => localStorage.getItem('user'));

  const handleLoaderComplete = () => {
    setLoading(false);
  };

  const handleLoginSuccess = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app-root">
      {/* Step 1: 3D Initial App Loader */}
      {loading ? (
        <AppLoader3D onComplete={handleLoaderComplete} />
      ) : !user ? (
        /* Step 2: Login / Register Page (if not authenticated) */
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* Step 3: Field Dashboard (if authenticated) */
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
