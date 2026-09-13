import { useEffect } from 'react';
import { useAppSelector } from './hooks';

/**
 * Keeps the <html> element's `dark` class and `data-font-size` attribute in
 * sync with the personal environment preferences stored in redux (theme,
 * font size). Mounted once near the root so these apply before/while the
 * app renders. These are per-user display preferences, distinct from the
 * organization-wide System Settings that only System Admin can change.
 */
export function useThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);
  const fontSize = useAppSelector((s) => s.ui.fontSize);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);
}
