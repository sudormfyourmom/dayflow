import { describe, it, expect } from 'vitest';
import { TaskRow } from '../src/types';

describe('Task Filtering and Categorization', () => {
  const sampleTasks: TaskRow[] = [
    {
      id: '1',
      user_id: 'user-a',
      title: 'Zadanie dzisiaj',
      description: '',
      status: 'todo',
      priority: 'high',
      due_date: '2026-10-22',
      start_at: '2026-10-22T09:00:00Z',
      end_at: '2026-10-22T10:00:00Z',
      category: 'Praca',
      recurrence_rule: 'none',
      reminder_at: null,
      completed_at: null,
      created_at: '2026-10-22T08:00:00Z',
      updated_at: '2026-10-22T08:00:00Z',
      deleted_at: null,
    },
    {
      id: '2',
      user_id: 'user-a',
      title: 'Przeterminowane zadanie',
      description: '',
      status: 'todo',
      priority: 'urgent',
      due_date: '2026-10-20',
      start_at: null,
      end_at: null,
      category: 'Osobiste',
      recurrence_rule: 'none',
      reminder_at: null,
      completed_at: null,
      created_at: '2026-10-20T08:00:00Z',
      updated_at: '2026-10-20T08:00:00Z',
      deleted_at: null,
    },
    {
      id: '3',
      user_id: 'user-a',
      title: 'Ukończone zadanie',
      description: '',
      status: 'completed',
      priority: 'normal',
      due_date: '2026-10-22',
      start_at: null,
      end_at: null,
      category: 'Praca',
      recurrence_rule: 'none',
      reminder_at: null,
      completed_at: '2026-10-22T10:30:00Z',
      created_at: '2026-10-22T08:00:00Z',
      updated_at: '2026-10-22T10:30:00Z',
      deleted_at: null,
    },
  ];

  it('correctly filters tasks for today', () => {
    const today = '2026-10-22';
    const todayTasks = sampleTasks.filter((t) => t.due_date === today);
    expect(todayTasks.length).toBe(2);
  });

  it('correctly detects overdue pending tasks', () => {
    const today = '2026-10-22';
    const overdue = sampleTasks.filter(
      (t) => t.due_date && t.due_date < today && t.status !== 'completed'
    );
    expect(overdue.length).toBe(1);
    expect(overdue[0].id).toBe('2');
  });

  it('filters urgent and high priority tasks for daily dashboard', () => {
    const priorityTasks = sampleTasks.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
    );
    expect(priorityTasks.length).toBe(2);
  });
});
