import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('saveplus_theme');
    return saved ? saved === 'dark' : false; // default light mode for clean bright feel
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isAuthPage = ['/login', '/register', '/forgot-password', '/otp-verify', '/profile-setup'].includes(location.pathname);

    if (darkMode && !isAuthPage) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [darkMode, location.pathname]);

  // Keep localStorage updated when theme state changes
  useEffect(() => {
    localStorage.setItem('saveplus_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
