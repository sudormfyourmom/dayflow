import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Globe,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getDomainFromUrl } from '@/lib/utils';

interface HistoryViewProps {
  onOpenInBrowser: (url: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenInBrowser }) => {
  const { history, deleteHistoryItem, clearHistory, isLoading } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
  });

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            Historia przeglądania
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Dziennik odwiedzonych stron z zachowaniem Twojej prywatności
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz wyczyścić całą historię przeglądania?')) {
                clearHistory();
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Wyczyść historię
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-surface rounded-xl border border-border-subtle">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Szukaj w historii odwiedzonych stron..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs bg-surface-elevated"
        />
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto bg-surface rounded-2xl border border-border-subtle p-2 divide-y divide-border-subtle/50">
        {isLoading ? (
          <div className="py-12 text-center text-text-muted text-sm">Ładowanie historii...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center space-y-3 p-8">
            <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto text-text-muted">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-text-primary">Brak wpisów w historii</p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Historia przeglądania jest pusta. Odwiedzone witryny w przeglądarce DayFlow pojawią się tutaj.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="py-3 px-4 hover:bg-surface-elevated/60 rounded-xl transition-all flex items-center justify-between group"
            >
              <div
                className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                onClick={() => onOpenInBrowser(item.url)}
              >
                <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted shrink-0">
                  <Globe className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-light transition-colors">
                    {item.title || getDomainFromUrl(item.url)}
                  </p>
                  <p className="text-xs text-text-muted truncate mt-0.5 font-mono">
                    {item.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(item.visited_at).toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' • '}
                  {new Date(item.visited_at).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>

                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="p-1.5 text-text-muted hover:text-status-danger rounded hover:bg-surface-elevated opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Usuń ten wpis"
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
