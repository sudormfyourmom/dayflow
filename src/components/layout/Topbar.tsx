import React from 'react';
import { Search, Plus, Minus, Square, X, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ActiveView } from '@/types';

interface TopbarProps {
  activeView: ActiveView;
  onOpenSearch: () => void;
  onOpenNewTask: () => void;
  onOpenNewNote: () => void;
}

const VIEW_TITLES: Record<ActiveView, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Przegląd Twojego dnia i priorytetów' },
  today: { title: 'Dzisiaj', subtitle: 'Zadania i harmonogram na dzisiejszy dzień' },
  tasks: { title: 'Zadania', subtitle: 'Zarządzanie projektami i listami zadań' },
  calendar: { title: 'Kalendarz', subtitle: 'Oś czasu i planowanie terminów' },
  notes: { title: 'Notatnik', subtitle: 'Zaawansowany edytor notatek i dokumentów' },
  browser: { title: 'Przeglądarka', subtitle: 'Wbudowana przestrzeń sieciowa i podzielony ekran' },
  bookmarks: { title: 'Zakładki', subtitle: 'Zapisane witryny i ulubione źródła' },
  history: { title: 'Historia', subtitle: 'Dziennik przeglądania sieci' },
  settings: { title: 'Ustawienia', subtitle: 'Preferencje konta, motyw i synchronizacja' },
};

export const Topbar: React.FC<TopbarProps> = ({
  activeView,
  onOpenSearch,
  onOpenNewTask,
  onOpenNewNote,
}) => {
  const { user, profile, isConfigured, isOffline } = useAuth();
  const viewInfo = VIEW_TITLES[activeView];

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <header className="h-14 border-b border-border-subtle bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 z-20 titlebar-drag-region select-none">
      {/* Left: View Title & Subtitle */}
      <div className="flex items-center gap-3 titlebar-no-drag">
        <div>
          <h1 className="text-sm font-semibold text-text-primary leading-tight flex items-center gap-2">
            {viewInfo.title}
          </h1>
          <p className="text-xs text-text-secondary leading-none">{viewInfo.subtitle}</p>
        </div>
      </div>

      {/* Center: Global Search Trigger */}
      <div className="flex-1 max-w-md mx-6 titlebar-no-drag">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-surface-elevated/70 hover:bg-surface-elevated border border-border-subtle hover:border-border rounded-lg text-text-secondary text-xs transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
            <span>Szukaj zadań, notatek, stron...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border-subtle rounded text-text-muted shadow-sm">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions, Sync status, Profile & Window Controls */}
      <div className="flex items-center gap-2.5 titlebar-no-drag">
        {/* Quick Add Buttons */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewTask}
          className="h-7 text-xs px-2.5 bg-surface-elevated"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Zadanie</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewNote}
          className="h-7 text-xs px-2.5 bg-surface-elevated"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Notatka</span>
        </Button>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated/70 border border-border-subtle text-xs text-text-secondary">
          {isOffline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] text-amber-300 font-medium">Tryb Offline (Lokalny)</span>
            </>
          ) : isConfigured ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-status-success" />
              <span className="text-[11px] text-emerald-400 font-medium">Połączono (Chmura)</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-status-warning" />
              <span className="text-[11px] text-amber-400 font-medium">Tryb Offline</span>
            </>
          )}
        </div>

        {/* Profile Avatar / Initials */}
        <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-semibold text-accent-light">
          {profile?.display_name
            ? profile.display_name.charAt(0).toUpperCase()
            : user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>

        {/* Custom Window Controls for Windows */}
        <div className="flex items-center gap-1 ml-2 border-l border-border-subtle pl-2">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
            title="Minimalizuj"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
            title="Maksymalizuj"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-status-danger/20 hover:text-red-400 text-text-muted transition-colors"
            title="Zamknij"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
