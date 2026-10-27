import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckSquare, FileText, Bookmark, Folder, ArrowRight, X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ActiveView } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ActiveView, itemId?: string) => void;
}

interface PaletteItem {
  id: string;
  type: 'task' | 'note' | 'bookmark' | 'folder';
  title: string;
  subtitle?: string;
  view: ActiveView;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { tasks } = useTasks();
  const { notes, folders } = useNotes();
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable items
  const allItems: PaletteItem[] = [
    ...tasks.map((t) => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      subtitle: `Zadanie • ${t.category} • ${t.status}`,
      view: 'tasks' as ActiveView,
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: 'note' as const,
      title: n.title,
      subtitle: `Notatka • ${new Date(n.updated_at).toLocaleDateString()}`,
      view: 'notes' as ActiveView,
    })),
    ...bookmarks.map((b) => ({
      id: b.id,
      type: 'bookmark' as const,
      title: b.title,
      subtitle: `Zakładka • ${b.url}`,
      view: 'bookmarks' as ActiveView,
    })),
    ...folders.map((f) => ({
      id: f.id,
      type: 'folder' as const,
      title: f.name,
      subtitle: 'Folder notatek',
      view: 'notes' as ActiveView,
    })),
  ];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 10);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        onNavigate(selected.view, selected.id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border-subtle bg-surface-subtle">
          <Search className="w-5 h-5 text-accent mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Wpisz szukaną frazę (zadania, notatki, zakładki)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border-subtle/50">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              Brak wyników dla "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon =
                item.type === 'task'
                  ? CheckSquare
                  : item.type === 'note'
                  ? FileText
                  : item.type === 'bookmark'
                  ? Bookmark
                  : Folder;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onNavigate(item.view, item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent/15 border border-accent/30 text-white' : 'hover:bg-surface-elevated text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-accent text-white' : 'bg-surface-elevated text-text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-text-muted leading-tight truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && <ArrowRight className="w-4 h-4 text-accent shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-subtle flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ Nawiguj</span>
            <span>↵ Otwórz</span>
            <span>ESC Zamknij</span>
          </div>
          <span>DayFlow Global Search</span>
        </div>
      </div>
    </div>
  );
};
