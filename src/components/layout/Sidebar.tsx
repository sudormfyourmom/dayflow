import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Calendar,
  FileText,
  Globe,
  Bookmark,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { ActiveView } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { todayTasks, pendingTasks } = useTasks();
  const { activeNotes } = useNotes();

  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'today' as ActiveView,
      label: 'Dzisiaj',
      icon: CalendarCheck,
      count: todayTasks.length > 0 ? todayTasks.length : undefined,
    },
    {
      id: 'tasks' as ActiveView,
      label: 'Zadania',
      icon: CheckSquare,
      count: pendingTasks.length > 0 ? pendingTasks.length : undefined,
    },
    { id: 'calendar' as ActiveView, label: 'Kalendarz', icon: Calendar },
    {
      id: 'notes' as ActiveView,
      label: 'Notatki',
      icon: FileText,
      count: activeNotes.length > 0 ? activeNotes.length : undefined,
    },
    { id: 'browser' as ActiveView, label: 'Przeglądarka', icon: Globe },
    { id: 'bookmarks' as ActiveView, label: 'Zakładki', icon: Bookmark },
    { id: 'history' as ActiveView, label: 'Historia', icon: History },
    { id: 'settings' as ActiveView, label: 'Ustawienia', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'h-screen bg-surface border-r border-border-subtle flex flex-col justify-between transition-all duration-200 select-none z-30 relative',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Top Header & Branding */}
      <div>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
          <div className="flex items-center overflow-hidden">
            <img
              src={isCollapsed ? './dayflow-mark.svg' : './dayflow-logo.svg'}
              alt="DayFlow"
              className={isCollapsed ? 'w-8 h-8 shrink-0' : 'w-[136px] h-auto shrink-0'}
            />
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            title={isCollapsed ? 'Rozwiń pasek boczny' : 'Zwiń pasek boczny'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-accent/15 text-accent-light border border-accent/25 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-accent-light' : 'text-text-muted group-hover:text-text-primary'
                  )}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {item.count !== undefined && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                          isActive
                            ? 'bg-accent/30 text-white'
                            : 'bg-surface-elevated text-text-muted group-hover:text-text-secondary'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Sign Out */}
      <div className="p-2 border-t border-border-subtle">
        <div
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-elevated transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent-light shrink-0">
            {profile?.display_name
              ? profile.display_name.charAt(0).toUpperCase()
              : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-text-primary truncate">
                {profile?.display_name || user?.email?.split('@')[0] || 'Użytkownik'}
              </p>
              <p className="text-[11px] text-text-muted truncate">{user?.email || 'Brak konta'}</p>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={signOut}
              className="text-text-muted hover:text-status-danger p-1.5 rounded hover:bg-surface-subtle transition-colors"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
