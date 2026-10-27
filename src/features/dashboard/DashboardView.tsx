import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  Flame,
  FileText,
  Globe,
  Plus,
  ArrowRight,
  Pin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { useHistory } from '@/hooks/useHistory';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getGreeting, getDomainFromUrl } from '@/lib/utils';
import { ActiveView } from '@/types';

interface DashboardViewProps {
  onNavigate: (view: ActiveView, itemId?: string) => void;
  onOpenNewTask: () => void;
  onOpenNewNote: () => void;
  onOpenNewTab: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTask,
  onOpenNewNote,
  onOpenNewTab,
}) => {
  const { profile, user } = useAuth();
  const { todayTasks, completedTasks, pendingTasks, overdueTasks, toggleComplete } = useTasks();
  const { notes, pinnedNotes } = useNotes();
  const { history } = useHistory();

  // Live digital clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getGreeting();
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Użytkowniku';

  // Format date: e.g. "Czwartek, 22 października 2026"
  const formattedDate = currentTime.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Priorities of the day (urgent & high)
  const priorityTasks = pendingTasks
    .filter((t) => t.priority === 'urgent' || t.priority === 'high')
    .slice(0, 5);

  const recentNotes = pinnedNotes.length > 0 ? pinnedNotes.slice(0, 4) : notes.slice(0, 4);
  const recentSites = history.slice(0, 4);

  return (
    <div className="h-full overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner & Digital Clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-surface to-surface-elevated border border-border-subtle shadow-sm">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Twoje centrum produktywności
          </span>
          <h2 className="text-2xl font-bold text-text-primary mt-1">
            {greeting}, {displayName} 👋
          </h2>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-2 capitalize">
            <Calendar className="w-4 h-4 text-text-muted" />
            {formattedDate}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-background/80 border border-border-subtle flex items-center gap-2.5 shadow-inner">
            <Clock className="w-5 h-5 text-accent" />
            <span className="font-mono text-xl font-bold text-white tracking-wider">
              {formattedTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onOpenNewTask} className="h-9">
              <Plus className="w-4 h-4" />
              <span>Zadanie</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={onOpenNewNote} className="h-9">
              <Plus className="w-4 h-4" />
              <span>Notatka</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={onOpenNewTab} className="h-9">
              <Globe className="w-4 h-4" />
              <span>Karta</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Tasks */}
        <div
          onClick={() => onNavigate('today')}
          className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Zadania na dziś</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-accent group-hover:text-white transition-colors">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{todayTasks.length}</p>
          <span className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
            Zobacz harmonogram <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Ukończone</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{completedTasks.length}</p>
          <span className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
            Wszystkie zadania
          </span>
        </div>

        {/* Pending */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Do zrobienia</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{pendingTasks.length}</p>
          <span className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
            Pozostało do realizacji
          </span>
        </div>

        {/* Overdue */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-status-danger/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Przeterminowane</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overdueTasks.length}</p>
          <span className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
            Wymagają uwagi
          </span>
        </div>
      </div>

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priorities & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priorities Section */}
          <div className="p-5 rounded-2xl bg-surface border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-text-primary">Priorytety dnia</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('tasks')}
                className="text-xs h-7 text-text-secondary"
              >
                Wszystkie zadania <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="pt-3 divide-y divide-border-subtle/50">
              {priorityTasks.length === 0 ? (
                <div className="py-6 text-center text-text-muted text-xs">
                  Brak pilnych zadań na liście. Świetna robota!
                </div>
              ) : (
                priorityTasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between hover:bg-surface-elevated/50 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleComplete({ id: task.id, currentStatus: task.status })}
                        className="w-4 h-4 rounded border-border-strong bg-surface text-accent focus:ring-accent cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-text-primary leading-tight">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {task.category} {task.due_date && `• Termin: ${task.due_date}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={task.priority === 'urgent' ? 'urgent' : 'high'}>
                      {task.priority === 'urgent' ? 'Pilne' : 'Wysoki'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today Tasks List */}
          <div className="p-5 rounded-2xl bg-surface border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">Harmonogram na dzisiaj</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('today')}
                className="text-xs h-7 text-text-secondary"
              >
                Otwórz widok dnia <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="pt-3 divide-y divide-border-subtle/50">
              {todayTasks.length === 0 ? (
                <div className="py-6 text-center text-text-muted text-xs">
                  Brak zaplanowanych zadań na dzisiaj. Kliknij poniżej, aby dodać pierwsze!
                  <div className="mt-3">
                    <Button size="sm" variant="secondary" onClick={onOpenNewTask}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Zaplanuj zadanie
                    </Button>
                  </div>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between hover:bg-surface-elevated/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleComplete({ id: task.id, currentStatus: task.status })}
                        className="w-4 h-4 rounded border-border-strong bg-surface text-accent focus:ring-accent cursor-pointer"
                      />
                      <div>
                        <p
                          className={`text-sm font-medium leading-tight ${
                            task.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {task.start_at
                            ? `${new Date(task.start_at).toLocaleTimeString('pl-PL', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} - ${task.category}`
                            : task.category}
                        </p>
                      </div>
                    </div>
                    <Badge variant={task.priority as any}>{task.priority}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Notes & Visited Sites */}
        <div className="space-y-6">
          {/* Recent / Pinned Notes */}
          <div className="p-5 rounded-2xl bg-surface border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-light" />
                <h3 className="text-sm font-semibold text-text-primary">Ostatnie notatki</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('notes')}
                className="text-xs h-7 text-text-secondary"
              >
                Wszystkie <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="pt-3 space-y-2">
              {recentNotes.length === 0 ? (
                <div className="py-6 text-center text-text-muted text-xs">
                  Brak utworzonych notatek.
                  <div className="mt-3">
                    <Button size="sm" variant="secondary" onClick={onOpenNewNote}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Nowa notatka
                    </Button>
                  </div>
                </div>
              ) : (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onNavigate('notes', note.id)}
                    className="p-3 rounded-xl bg-surface-elevated/70 hover:bg-surface-elevated border border-border-subtle hover:border-border cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-light transition-colors">
                        {note.title || 'Bez tytułu'}
                      </p>
                      {note.is_pinned && <Pin className="w-3.5 h-3.5 text-accent shrink-0" />}
                    </div>
                    <span className="text-[11px] text-text-muted block mt-1">
                      {new Date(note.updated_at).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visited Sites / Browser Activity */}
          <div className="p-5 rounded-2xl bg-surface border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-text-primary">Ostatnie strony</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('history')}
                className="text-xs h-7 text-text-secondary"
              >
                Historia <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="pt-3 space-y-2">
              {recentSites.length === 0 ? (
                <div className="py-6 text-center text-text-muted text-xs">
                  Brak zapisanej historii przeglądania.
                  <div className="mt-3">
                    <Button size="sm" variant="secondary" onClick={onOpenNewTab}>
                      <Globe className="w-3.5 h-3.5 mr-1" /> Otwórz kartę
                    </Button>
                  </div>
                </div>
              ) : (
                recentSites.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.electronAPI?.createTab(item.url);
                      onNavigate('browser');
                    }}
                    className="p-2.5 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated border border-border-subtle cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="truncate mr-2">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {item.title || getDomainFromUrl(item.url)}
                      </p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{item.url}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-accent shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
