import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Loading } from './components/ui/Loading';
import { User } from './types';

// NOTE: In a production environment, you would import 'onAuthStateChanged' from firebase/auth
// and manage the session persistence there. For this portable version, we use local state.

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session (Simulated)
    // Prioritize localStorage (Remember Me), then sessionStorage
    const storedUser = localStorage.getItem('mgs_user') || sessionStorage.getItem('mgs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Simulate a brief loading delay for better UX
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleLogin = (email: string, remember: boolean) => {
    const newUser = { email };
    setUser(newUser);
    
    if (remember) {
      localStorage.setItem('mgs_user', JSON.stringify(newUser));
    } else {
      sessionStorage.setItem('mgs_user', JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mgs_user');
    sessionStorage.removeItem('mgs_user');
  };

  if (loading) {
    return <Loading />;
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