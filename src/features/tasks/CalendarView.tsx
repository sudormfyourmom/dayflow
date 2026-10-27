import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CalendarViewProps {
  onOpenNewTask: (date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenNewTask }) => {
  const { tasks, toggleComplete } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // 0 = Sunday, 1 = Monday... Polish week starts with Monday
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const totalDays = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(today.toISOString().split('T')[0]);
  };

  const monthName = currentDate.toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  });

  const weekDayHeaders = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

  // Days grid
  const daysArray = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  // Selected day's tasks
  const selectedDayTasks = tasks.filter((t) => t.due_date === selectedDayStr);

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white capitalize">{monthName}</h2>
          <div className="flex items-center gap-1 bg-surface border border-border-subtle rounded-lg p-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-0.5 text-xs text-text-secondary hover:text-white rounded hover:bg-surface-elevated"
            >
              Dzisiaj
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button onClick={() => onOpenNewTask(selectedDayStr)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Dodaj na wybrany dzień
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left 2 Cols: Monthly Grid */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-subtle p-4 flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-border-subtle">
            {weekDayHeaders.map((w) => (
              <span key={w} className="text-xs font-semibold text-text-muted">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 flex-1 py-2">
            {daysArray.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="p-2 rounded-lg opacity-20" />;
              }

              const formattedDay = String(dayNum).padStart(2, '0');
              const formattedMonth = String(month + 1).padStart(2, '0');
              const dayStr = `${year}-${formattedMonth}-${formattedDay}`;

              const isSelected = selectedDayStr === dayStr;
              const isToday = new Date().toISOString().split('T')[0] === dayStr;
              const dayTasks = tasks.filter((t) => t.due_date === dayStr);

              return (
                <div
                  key={dayStr}
                  onClick={() => setSelectedDayStr(dayStr)}
                  className={`p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer min-h-[70px] ${
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : isToday
                      ? 'border-accent/40 bg-surface-elevated'
                      : 'border-border-subtle/40 bg-surface-subtle hover:bg-surface-elevated hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'text-accent-light' : 'text-text-primary'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent-light font-bold">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tiny task indicator pills */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] truncate px-1 py-0.5 rounded bg-surface-elevated text-text-secondary"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-text-muted block">
                        +{dayTasks.length - 2} więcej
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Day Agenda */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-semibold text-white">Harmonogram dnia</h3>
              <p className="text-xs text-text-muted">{selectedDayStr}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => onOpenNewTask(selectedDayStr)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Zadanie
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 divide-y divide-border-subtle/50">
            {selectedDayTasks.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-xs">
                Brak zadań w wybranym dniu.
              </div>
            ) : (
              selectedDayTasks.map((t) => (
                <div key={t.id} className="py-2.5 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={t.status === 'completed'}
                      onChange={() => toggleComplete({ id: t.id, currentStatus: t.status })}
                      className="mt-1 w-4 h-4 rounded border-border-strong bg-surface text-accent cursor-pointer"
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          t.status === 'completed' ? 'line-through text-text-muted' : 'text-white'
                        }`}
                      >
                        {t.title}
                      </p>
                      {t.start_at && (
                        <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(t.start_at).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={t.priority as any}>{t.priority}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
