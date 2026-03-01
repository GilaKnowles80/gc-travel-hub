import React, { createContext, useState, useEffect } from 'react';

export const AdminModeContext = createContext();

export function AdminModeProvider({ children }) {
  const [adminMode, setAdminMode] = useState(false);

  // Persist admin mode to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('gc-admin-mode');
    if (stored === 'true') setAdminMode(true);
  }, []);

  const toggleAdminMode = () => {
    const newMode = !adminMode;
    setAdminMode(newMode);
    localStorage.setItem('gc-admin-mode', newMode);
  };

  return (
    <AdminModeContext.Provider value={{ adminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = React.useContext(AdminModeContext);
  if (!context) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
}