import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
