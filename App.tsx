import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User } from './types';

// NOTE: In a production environment, you would import 'onAuthStateChanged' from firebase/auth
// and manage the session persistence there. For this portable version, we use local state.

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session (Simulated)
    const storedUser = localStorage.getItem('mgs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (email: string) => {
    const newUser = { email };
    setUser(newUser);
    localStorage.setItem('mgs_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mgs_user');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-green-500">Carregando...</div>;
  }

  return (
    <>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;