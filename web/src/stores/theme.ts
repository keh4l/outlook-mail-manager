import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: stored || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));

// 初始化主题
applyTheme(stored || 'dark');
