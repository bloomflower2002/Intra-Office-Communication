import { useEffect } from 'react';
import { useAppSelector } from './hooks';

/**
 * Keeps the <html> element's `dark` class in sync with the theme stored in redux.
 * Mounted once near the root so the class is applied before/while the app renders.
 */
export function useThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
}
