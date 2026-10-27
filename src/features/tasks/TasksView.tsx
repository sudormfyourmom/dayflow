import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Trash2,
  Clock,
  Tag,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TaskPriority } from '@/types';

type FilterTab = 'all' | 'today' | 'tomorrow' | 'upcoming' | 'completed' | 'overdue';

interface TasksViewProps {
  initialTab?: FilterTab;
  onOpenNewTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  initialTab = 'all',
  onOpenNewTask,
}) => {
  const { tasks, toggleComplete, deleteTask, isLoading } = useTasks();
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Distinct categories
  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCat = t.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }

    // Tab filter
    switch (activeTab) {
      case 'today':
        return t.due_date === todayStr && t.status !== 'completed';
      case 'tomorrow':
        return t.due_date === tomorrowStr && t.status !== 'completed';
      case 'upcoming':
        return t.due_date && t.due_date > todayStr && t.status !== 'completed';
      case 'overdue':
        return t.due_date && t.due_date < todayStr && t.status !== 'completed';
      case 'completed':
        return t.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'normal':
        return 'normal';
      case 'low':
      default:
        return 'low';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'Wszystkie' },
              { id: 'today', label: 'Dzisiaj' },
              { id: 'tomorrow', label: 'Jutro' },
              { id: 'upcoming', label: 'Nadchodzące' },
              { id: 'overdue', label: 'Przeterminowane' },
              { id: 'completed', label: 'Ukończone' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button onClick={onOpenNewTask} size="sm" className="h-9 shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Dodaj zadanie
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle">
        <div className="flex-1 min-w-[200px]">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Szukaj zadań po tytule, opisie lub kategorii..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-surface-elevated"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-surface-elevated border border-border rounded-md px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent h-8"
        >
          <option value="all">Wszystkie priorytety</option>
          <option value="urgent">Pilne 🔥</option>
          <option value="high">Wysokie</option>
          <option value="normal">Normalne</option>
          <option value="low">Niskie</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-surface-elevated border border-border rounded-md px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent h-8"
        >
          <option value="all">Wszystkie kategorie</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto bg-surface rounded-2xl border border-border-subtle p-2 divide-y divide-border-subtle/60">
        {isLoading ? (
          <div className="py-12 text-center text-text-muted text-sm">Ładowanie zadań...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto text-text-muted">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-text-primary">Brak zadań w wybranym widoku</p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Nie znaleziono żadnych zadań pasujących do bieżących filtrów.
            </p>
            <Button size="sm" variant="secondary" onClick={onOpenNewTask} className="mt-2">
              <Plus className="w-3.5 h-3.5 mr-1" /> Dodaj nowe zadanie
            </Button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="py-3 px-3 hover:bg-surface-elevated/60 rounded-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => toggleComplete({ id: task.id, currentStatus: task.status })}
                  className="w-4 h-4 rounded border-border-strong bg-surface text-accent focus:ring-accent cursor-pointer shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm font-medium leading-snug truncate ${
                        task.status === 'completed'
                          ? 'line-through text-text-muted'
                          : 'text-text-primary'
                      }`}
                    >
                      {task.title}
                    </p>
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {task.priority === 'urgent'
                        ? 'Pilne'
                        : task.priority === 'high'
                        ? 'Wysoki'
                        : task.priority === 'normal'
                        ? 'Normalny'
                        : 'Niski'}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1.5 flex-wrap">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-text-muted" />
                        {task.due_date}
                      </span>
                    )}

                    {task.start_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted" />
                        {new Date(task.start_at).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-text-muted" />
                      {task.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 shrink-0">
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-text-muted hover:text-status-danger rounded-md hover:bg-surface-elevated transition-colors"
                  title="Usuń zadanie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
