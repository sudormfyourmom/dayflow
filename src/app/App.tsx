import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthView } from '@/features/auth/AuthView';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { TasksView } from '@/features/tasks/TasksView';
import { CalendarView } from '@/features/tasks/CalendarView';
import { DayScheduleView } from '@/features/tasks/DayScheduleView';
import { NotesView } from '@/features/notes/NotesView';
import { BrowserView } from '@/features/browser/BrowserView';
import { BookmarksView } from '@/features/bookmarks/BookmarksView';
import { HistoryView } from '@/features/history/HistoryView';
import { SettingsView } from '@/features/settings/SettingsView';
import { ActiveView } from '@/types';
import { Loader2, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const { session, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [initialTaskDate, setInitialTaskDate] = useState<string | undefined>(undefined);

  const handleNavigate = (view: ActiveView, targetId?: string) => {
    setActiveView(view);
    setSelectedItemId(targetId);
  };

  const handleOpenNewTask = (date?: string) => {
    setInitialTaskDate(date);
    setIsNewTaskOpen(true);
  };

  const handleOpenInBrowser = (url: string) => {
    if (window.electronAPI) {
      window.electronAPI.createTab(url);
    }
    setActiveView('browser');
  };

  // 1. Loading screen during session restoration
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center space-y-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-indigo-400 flex items-center justify-center text-white shadow-xl shadow-accent/30 animate-pulse">
          <Zap className="w-6 h-6 fill-white" />
        </div>
        <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span>Wczytywanie DayFlow...</span>
        </div>
      </div>
    );
  }

  // 2. Authentication view
  if (!session) {
    return <AuthView />;
  }

  // 3. Authenticated desktop workspace
  return (
    <MainLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      isNewTaskOpen={isNewTaskOpen}
      onOpenNewTask={handleOpenNewTask}
      onCloseNewTask={() => setIsNewTaskOpen(false)}
      isNewNoteOpen={isNewNoteOpen}
      onOpenNewNote={() => setIsNewNoteOpen(true)}
      onCloseNewNote={() => setIsNewNoteOpen(false)}
      initialTaskDate={initialTaskDate}
    >
      {activeView === 'dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onOpenNewTask={() => handleOpenNewTask()}
          onOpenNewNote={() => setIsNewNoteOpen(true)}
          onOpenNewTab={() => {
            window.electronAPI?.createTab();
            setActiveView('browser');
          }}
        />
      )}

      {activeView === 'today' && (
        <DayScheduleView onOpenNewTask={handleOpenNewTask} />
      )}

      {activeView === 'tasks' && (
        <TasksView onOpenNewTask={() => handleOpenNewTask()} />
      )}

      {activeView === 'calendar' && (
        <CalendarView onOpenNewTask={handleOpenNewTask} />
      )}

      {activeView === 'notes' && (
        <NotesView initialNoteId={selectedItemId} />
      )}

      {activeView === 'browser' && <BrowserView />}

      {activeView === 'bookmarks' && (
        <BookmarksView onOpenInBrowser={handleOpenInBrowser} />
      )}

      {activeView === 'history' && (
        <HistoryView onOpenInBrowser={handleOpenInBrowser} />
      )}

      {activeView === 'settings' && <SettingsView />}
    </MainLayout>
  );
};
