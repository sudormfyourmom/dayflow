import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  Home,
  Bookmark,
  Copy,
  Lock,
  Globe,
  FilePlus,
  Check,
} from 'lucide-react';
import { TabState } from '@/types/electron';
import { useBookmarks } from '@/hooks/useBookmarks';

interface NavigationBarProps {
  activeTab: TabState | null;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onStop: () => void;
  onCreateNoteFromPage: (title: string, url: string) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  onCreateNoteFromPage,
}) => {
  const [urlInput, setUrlInput] = useState(activeTab?.url || '');
  const [isCopied, setIsCopied] = useState(false);
  const { bookmarks, addBookmark } = useBookmarks();

  useEffect(() => {
    if (activeTab?.url) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onNavigate(urlInput.trim());
    }
  };

  const handleCopyUrl = () => {
    if (activeTab?.url) {
      navigator.clipboard.writeText(activeTab.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }
  };

  const isBookmarked = bookmarks.some((b) => b.url === activeTab?.url);

  const handleToggleBookmark = async () => {
    if (!activeTab || isBookmarked) return;
    try {
      await addBookmark({
        title: activeTab.title || 'Nowa zakładka',
        url: activeTab.url,
        folder: 'Favorites',
      });
    } catch (err) {
      console.warn('[NavigationBar] Error adding bookmark:', err);
    }
  };

  const isHttps = activeTab?.url.startsWith('https://');

  return (
    <div className="h-11 bg-surface border-b border-border-subtle flex items-center justify-between px-3 gap-2">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onGoBack}
          disabled={!activeTab?.canGoBack}
          className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Wstecz (Alt + Lewo)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onGoForward}
          disabled={!activeTab?.canGoForward}
          className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Dalej (Alt + Prawo)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {activeTab?.isLoading ? (
          <button
            onClick={onStop}
            className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors"
            title="Zatrzymaj"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onReload}
            className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors"
            title="Odśwież"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onNavigate('https://www.google.com')}
          className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors"
          title="Strona startowa"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Address Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-2">
        <div className="relative flex items-center bg-surface-elevated border border-border rounded-lg px-2.5 py-1 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors">
          <div className="flex items-center mr-2 text-text-muted">
            {isHttps ? (
              <span title="Bezpieczne połączenie HTTPS">
                <Lock className="w-3.5 h-3.5 text-status-success" />
              </span>
            ) : (
              <Globe className="w-3.5 h-3.5 text-text-muted" />
            )}
          </div>

          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Wpisz adres URL lub wyszukaj w Google..."
            className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
          />

          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-1 rounded text-text-muted hover:text-white transition-colors ${
                isBookmarked ? 'text-amber-400 fill-amber-400' : ''
              }`}
              title={isBookmarked ? 'Strona dodana do zakładek' : 'Dodaj do zakładek'}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-1 rounded text-text-muted hover:text-white transition-colors"
              title="Kopiuj adres URL"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Integration Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (activeTab) {
              onCreateNoteFromPage(activeTab.title || 'Notatka ze strony', activeTab.url);
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border-subtle text-xs text-text-secondary hover:text-white transition-colors"
          title="Utwórz notatkę powiązaną z tą stroną"
        >
          <FilePlus className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">Notatka ze strony</span>
        </button>
      </div>
    </div>
  );
};
