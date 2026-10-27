import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DayScheduleViewProps {
  onOpenNewTask: (date?: string) => void;
}

export const DayScheduleView: React.FC<DayScheduleViewProps> = ({ onOpenNewTask }) => {
  const { tasks, toggleComplete } = useTasks();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 to 22:00

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Tasks for the selected date
  const dayTasks = tasks.filter((t) => t.due_date === selectedDate);

  // Check for time conflicts among tasks with start_at & end_at
  const timedTasks = dayTasks.filter((t) => t.start_at && t.end_at);
  const conflictTaskIds = new Set<string>();

  for (let i = 0; i < timedTasks.length; i++) {
    for (let j = i + 1; j < timedTasks.length; j++) {
      const aStart = new Date(timedTasks[i].start_at!).getTime();
      const aEnd = new Date(timedTasks[i].end_at!).getTime();
      const bStart = new Date(timedTasks[j].start_at!).getTime();
      const bEnd = new Date(timedTasks[j].end_at!).getTime();

      // Check overlap: aStart < bEnd && bStart < aEnd
      if (aStart < bEnd && bStart < aEnd) {
        conflictTaskIds.add(timedTasks[i].id);
        conflictTaskIds.add(timedTasks[j].id);
      }
    }
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-4">
      {/* Header with Day Navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Harmonogram dnia
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {new Date(selectedDate).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface border border-border-subtle rounded-lg p-1 ml-4">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 text-xs text-text-secondary hover:text-white rounded hover:bg-surface-elevated"
            >
              Dzisiaj
            </button>
            <button
              onClick={handleNextDay}
              className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button onClick={() => onOpenNewTask(selectedDate)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Zaplanuj wydarzenie
        </Button>
      </div>

      {/* Conflict Warning Alert if conflicts detected */}
      {conflictTaskIds.size > 0 && (
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-2.5 text-xs text-orange-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Wykryto konflikt czasowy! Niektóre zadania nakładają się na siebie w harmonogramie.
          </span>
        </div>
      )}

      {/* Main Timeline Board */}
      <div className="flex-1 overflow-y-auto bg-surface rounded-2xl border border-border-subtle p-6 space-y-2">
        {hours.map((hour) => {
          const hourLabel = `${String(hour).padStart(2, '0')}:00`;

          // Find tasks that fall within this hour
          const tasksInHour = dayTasks.filter((t) => {
            if (!t.start_at) return false;
            const taskHour = new Date(t.start_at).getHours();
            return taskHour === hour;
          });

          return (
            <div key={hour} className="flex items-start gap-4 min-h-[64px] group border-b border-border-subtle/30 pb-2">
              {/* Hour Column */}
              <div className="w-16 text-right font-mono text-xs text-text-muted group-hover:text-accent transition-colors pt-1 shrink-0">
                {hourLabel}
              </div>

              {/* Tasks in this slot */}
              <div className="flex-1 space-y-2">
                {tasksInHour.length === 0 ? (
                  <div className="h-8 border border-dashed border-border-subtle/40 rounded-lg flex items-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      onClick={() => onOpenNewTask(selectedDate)}
                      className="text-[11px] text-text-muted hover:text-accent cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Zaplanuj na {hourLabel}
                    </span>
                  </div>
                ) : (
                  tasksInHour.map((task) => {
                    const hasConflict = conflictTaskIds.has(task.id);

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          hasConflict
                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                            : 'bg-surface-elevated/80 border-border hover:border-accent/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() =>
                              toggleComplete({ id: task.id, currentStatus: task.status })
                            }
                            className="w-4 h-4 rounded border-border-strong bg-surface text-accent cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  task.status === 'completed'
                                    ? 'line-through text-text-muted'
                                    : 'text-white'
                                }`}
                              >
                                {task.title}
                              </span>
                              {hasConflict && (
                                <span className="flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-500/20 px-1.5 py-0.5 rounded">
                                  <AlertTriangle className="w-3 h-3" /> Konflikt
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                              <span>
                                {new Date(task.start_at!).toLocaleTimeString('pl-PL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {task.end_at &&
                                  ` - ${new Date(task.end_at).toLocaleTimeString('pl-PL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`}
                              </span>
                              <span>• {task.category}</span>
                            </p>
                          </div>
                        </div>

                        <Badge variant={task.priority as any}>{task.priority}</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
