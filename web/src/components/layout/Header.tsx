import { Moon, Sun, Monitor, Menu } from 'lucide-react';
import { useThemeStore } from '../../stores/theme';

interface Props {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: Props) {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <button onClick={onMenuClick} className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors">
        <Menu className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="hidden md:block" />
      <button
        onClick={cycleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
        title={`当前: ${theme === 'dark' ? '暗色' : theme === 'light' ? '亮色' : '跟随系统'}`}
      >
        <ThemeIcon className="h-4 w-4 text-muted-foreground" />
      </button>
    </header>
  );
}
