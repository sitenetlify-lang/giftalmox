import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/contexts/SettingsContext';

export default function TopBar({ title, subtitle }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const { settings } = useSettings();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => appClient.auth.me(),
  });

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right mr-2">
          <p className="text-sm font-semibold text-foreground">{settings.system_name}</p>
          <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Sessão administrativa ativa' : 'Modo operacional'}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleDark} className="text-muted-foreground hover:text-foreground">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-xs font-bold text-accent-foreground">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground hidden lg:block">
            {user?.full_name || 'Usuário'}
          </span>
        </div>
      </div>
    </header>
  );
}
