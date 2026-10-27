import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '@/components/dialogs/CommandPalette';
import { NewTaskModal } from '@/components/dialogs/NewTaskModal';
import { NewNoteModal } from '@/components/dialogs/NewNoteModal';
import { ActiveView } from '@/types';

interface MainLayoutProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, targetId?: string) => void;
  isNewTaskOpen: boolean;
  onOpenNewTask: (date?: string) => void;
  onCloseNewTask: () => void;
  isNewNoteOpen: boolean;
  onOpenNewNote: () => void;
  onCloseNewNote: () => void;
  initialTaskDate?: string;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeView,
  onNavigate,
  isNewTaskOpen,
  onOpenNewTask,
  onCloseNewTask,
  isNewNoteOpen,
  onOpenNewNote,
  onCloseNewNote,
  initialTaskDate,
  children,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or tiptap unless Ctrl modifier is pressed
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setIsSearchOpen((prev) => !prev);
        } else if (e.shiftKey && (e.key === 'n' || e.key === 'N')) {
          e.preventDefault();
          onOpenNewTask();
        } else if (!e.shiftKey && (e.key === 'n' || e.key === 'N')) {
          const target = e.target as HTMLElement;
          const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
          if (!isInput) {
            e.preventDefault();
            onOpenNewNote();
          }
        } else if (e.key === ',') {
          e.preventDefault();
          onNavigate('settings');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onNavigate, onOpenNewTask, onOpenNewNote]);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden select-none">
      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Topbar
          activeView={activeView}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewTask={() => onOpenNewTask()}
          onOpenNewNote={() => onOpenNewNote()}
        />

        <main className="flex-1 overflow-hidden relative bg-background">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={onCloseNewTask}
        defaultDueDate={initialTaskDate}
      />

      <NewNoteModal
        isOpen={isNewNoteOpen}
        onClose={onCloseNewNote}
        onNoteCreated={(noteId) => onNavigate('notes', noteId)}
      />
    </div>
  );
};
