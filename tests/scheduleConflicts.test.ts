import { describe, it, expect } from 'vitest';

interface ScheduledItem {
  id: string;
  start: string;
  end: string;
}

function detectConflicts(items: ScheduledItem[]): Set<string> {
  const conflictIds = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const aStart = new Date(items[i].start).getTime();
      const aEnd = new Date(items[i].end).getTime();
      const bStart = new Date(items[j].start).getTime();
      const bEnd = new Date(items[j].end).getTime();

      // Overlap condition
      if (aStart < bEnd && bStart < aEnd) {
        conflictIds.add(items[i].id);
        conflictIds.add(items[j].id);
      }
    }
  }
  return conflictIds;
}

describe('Timeline Schedule Conflict Detection', () => {
  it('identifies overlapping scheduled tasks', () => {
    const items: ScheduledItem[] = [
      { id: 'task-1', start: '2026-10-22T10:00:00Z', end: '2026-10-22T11:00:00Z' },
      { id: 'task-2', start: '2026-10-22T10:30:00Z', end: '2026-10-22T11:30:00Z' },
      { id: 'task-3', start: '2026-10-22T12:00:00Z', end: '2026-10-22T13:00:00Z' },
    ];

    const conflicts = detectConflicts(items);
    expect(conflicts.has('task-1')).toBe(true);
    expect(conflicts.has('task-2')).toBe(true);
    expect(conflicts.has('task-3')).toBe(false);
  });

  it('handles back-to-back non-overlapping tasks without false positive conflicts', () => {
    const items: ScheduledItem[] = [
      { id: 'task-1', start: '2026-10-22T10:00:00Z', end: '2026-10-22T11:00:00Z' },
      { id: 'task-2', start: '2026-10-22T11:00:00Z', end: '2026-10-22T12:00:00Z' },
    ];

    const conflicts = detectConflicts(items);
    expect(conflicts.size).toBe(0);
  });
});
