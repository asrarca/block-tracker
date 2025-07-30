'use client';
import React, { useState, useEffect } from 'react';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Handle hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      const isDarkTheme = savedTheme === 'dark';
      setIsDark(isDarkTheme);
      applyTheme(isDarkTheme);
    } else if (systemPrefersDark) {
      setIsDark(true);
      applyTheme(true);
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 float-right">
        <input 
          type="checkbox" 
          className="toggle toggle-sm" 
          checked={false}
          onChange={() => {}}
          disabled 
        />
        <span className="text-sm mr-2">🌞</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-4 float-right">
      <input
        type="checkbox"
        className="toggle toggle-sm"
        checked={isDark}
        onChange={toggleTheme}
        aria-label="Toggle dark mode"
        title="Toggle Dark Mode"
      />
      <span className="text-sm mr-2">
        {isDark ? '🌙' : '🌞'}
      </span>
    </div>
  );
};

export default DarkModeToggle;
