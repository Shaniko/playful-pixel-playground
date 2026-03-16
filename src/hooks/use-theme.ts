import { useState, useEffect } from 'react';

type Theme = 'arcade' | 'airy';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'arcade';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'airy') {
      document.documentElement.classList.add('theme-airy');
    } else {
      document.documentElement.classList.remove('theme-airy');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'arcade' ? 'airy' : 'arcade');

  return { theme, toggleTheme };
}
