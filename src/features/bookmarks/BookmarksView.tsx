import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Pin,
  Folder,
  Globe,
} from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getDomainFromUrl } from '@/lib/utils';

interface BookmarksViewProps {
  onOpenInBrowser: (url: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onOpenInBrowser }) => {
  const { bookmarks, addBookmark, deleteBookmark, updateBookmark, isLoading } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('Ulubione');

  const folders = Array.from(new Set(bookmarks.map((b) => b.folder).filter(Boolean)));

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedFolder !== 'all' && b.folder !== selectedFolder) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    await addBookmark({
      title: newTitle.trim(),
      url: formattedUrl,
      folder: newFolder.trim() || 'Ulubione',
      is_pinned: false,
    });

    setNewTitle('');
    setNewUrl('');
    setIsNewModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-accent" />
            Zakładki
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Zapisane strony i ulubione źródła w jednym miejscu
          </p>
        </div>

        <Button onClick={() => setIsNewModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Dodaj zakładkę
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle">
        <div className="flex-1 min-w-[200px]">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Szukaj zakładek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-surface-elevated"
          />
        </div>

        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="bg-surface-elevated border border-border rounded-md px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent h-8"
        >
          <option value="all">Wszystkie foldery</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Bookmarks Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center text-text-muted text-sm">Ładowanie zakładek...</div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-surface rounded-2xl border border-border-subtle p-8">
            <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto text-text-muted">
              <Bookmark className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-text-primary">Brak zakładek</p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Dodaj swoje ulubione witryny, aby mieć do nich natychmiastowy dostęp.
            </p>
            <Button size="sm" variant="secondary" onClick={() => setIsNewModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Dodaj pierwszą zakładkę
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded bg-surface-elevated flex items-center justify-center text-text-muted shrink-0">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {bookmark.title}
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        updateBookmark({ id: bookmark.id, updates: { is_pinned: !bookmark.is_pinned } })
                      }
                      className={`p-1 rounded hover:bg-surface-elevated transition-colors ${
                        bookmark.is_pinned ? 'text-accent' : 'text-text-muted'
                      }`}
                      title={bookmark.is_pinned ? 'Odepnij' : 'Przypnij'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-text-muted truncate mt-2 font-mono">
                    {getDomainFromUrl(bookmark.url)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle/50">
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Folder className="w-3 h-3" /> {bookmark.folder}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenInBrowser(bookmark.url)}
                      className="px-2 py-1 rounded bg-surface-elevated hover:bg-accent hover:text-white text-xs text-text-secondary transition-colors flex items-center gap-1"
                    >
                      <span>Otwórz</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="p-1 text-text-muted hover:text-status-danger rounded hover:bg-surface-elevated transition-colors"
                      title="Usuń zakładkę"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Bookmark Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nowa zakładka"
        description="Zapisz witrynę internetową do bazy DayFlow"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Nazwa witryny</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="np. GitHub, Hacker News"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Adres URL</label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Folder</label>
            <Input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="np. Ulubione, Narzędzia, Artykuły"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Anuluj
            </Button>
            <Button type="submit" variant="primary">
              Dodaj zakładkę
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
