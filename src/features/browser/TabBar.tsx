import React from 'react';
import { Plus, X, Globe, Loader2, Columns, SplitSquareVertical } from 'lucide-react';
import { TabState, SplitConfig } from '@/types/electron';

interface TabBarProps {
  tabs: TabState[];
  activeTabId: string | null;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCreateTab: () => void;
  splitConfig: SplitConfig;
  onToggleSplit: (mode: 'none' | 'split-a' | 'split-b') => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCreateTab,
  splitConfig,
  onToggleSplit,
}) => {
  return (
    <div className="h-10 bg-surface border-b border-border-subtle flex items-center justify-between px-2 gap-2 select-none">
      {/* Tabs scrollable list */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 h-full py-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              className={`h-full min-w-[140px] max-w-[220px] flex items-center justify-between px-3 rounded-lg text-xs font-medium cursor-pointer transition-all border group ${
                isActive
                  ? 'bg-surface-elevated text-white border-border shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate mr-2">
                {tab.isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent shrink-0" />
                ) : tab.favicon ? (
                  <img src={tab.favicon} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                )}
                <span className="truncate">{tab.title || 'Nowa karta'}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface-subtle text-text-muted hover:text-white transition-opacity shrink-0"
                title="Zamknij kartę"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={onCreateTab}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors shrink-0"
          title="Nowa karta (Ctrl + T)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Split-screen Mode Toggles */}
      <div className="flex items-center gap-1 bg-surface-elevated border border-border-subtle rounded-lg p-0.5 shrink-0">
        <button
          onClick={() => onToggleSplit('none')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            !splitConfig.enabled || splitConfig.mode === 'none'
              ? 'bg-surface text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Pojedyncza strona"
        >
          Pełny
        </button>

        <button
          onClick={() => onToggleSplit('split-a')}
          className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
            splitConfig.enabled && splitConfig.mode === 'split-a'
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Podzielony ekran: Przeglądarka + Notatka"
        >
          <Columns className="w-3 h-3" />
          <span>Web + Notatka</span>
        </button>

        <button
          onClick={() => onToggleSplit('split-b')}
          className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
            splitConfig.enabled && splitConfig.mode === 'split-b'
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Podzielony ekran: Dwie strony"
        >
          <SplitSquareVertical className="w-3 h-3" />
          <span>Dwie strony</span>
        </button>
      </div>
    </div>
  );
};
