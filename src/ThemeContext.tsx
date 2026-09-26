import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from './types';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('dhruva_theme');
      if (saved === 'daylight' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('dhruva_theme', theme);
    } catch {
      // Ignore
    }

    const root = document.documentElement;
    if (theme === 'daylight') {
      root.classList.add('daylight');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'daylight');
    } else {
      root.classList.add('dark');
      root.classList.remove('daylight');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'daylight' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
