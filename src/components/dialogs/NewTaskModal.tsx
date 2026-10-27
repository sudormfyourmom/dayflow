import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTasks } from '@/hooks/useTasks';
import { TaskPriority } from '@/types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDueDate?: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultDueDate,
}) => {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState('Praca');
  const [dueDate, setDueDate] = useState(defaultDueDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tytuł zadania jest wymagany');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let startAt: string | null = null;
      let endAt: string | null = null;

      if (dueDate && startTime) {
        startAt = new Date(`${dueDate}T${startTime}:00`).toISOString();
      }
      if (dueDate && endTime) {
        endAt = new Date(`${dueDate}T${endTime}:00`).toISOString();
      }

      await createTask({
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        priority,
        category,
        due_date: dueDate || null,
        start_at: startAt,
        end_at: endAt,
      });

      // Clear & close
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Nie udało się utworzyć zadania');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nowe zadanie"
      description="Dodaj zaplanowane zadanie do swojego harmonogramu"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-status-danger/10 border border-status-danger/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Tytuł zadania *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Co jest do zrobienia?"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Opis (opcjonalny)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dodatkowe szczegóły lub kroki..."
            rows={3}
            className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Priorytet</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="low">Niski</option>
              <option value="normal">Normalny</option>
              <option value="high">Wysoki</option>
              <option value="urgent">Pilny 🔥</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Kategoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="np. Praca, Osobiste, Projekt"
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Termin</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Od godziny</label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Do godziny</label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Dodaj zadanie
          </Button>
        </div>
      </form>
    </Modal>
  );
};
