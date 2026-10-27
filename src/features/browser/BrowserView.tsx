import React, { useState, useEffect, useRef } from 'react';
import { TabBar } from './TabBar';
import { NavigationBar } from './NavigationBar';
import { TabState, SplitConfig } from '@/types/electron';
import { useHistory } from '@/hooks/useHistory';
import { useNotes } from '@/hooks/useNotes';
import { NotesView } from '@/features/notes/NotesView';
import { ArrowLeftRight } from 'lucide-react';

export const BrowserView: React.FC = () => {
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    enabled: false,
    mode: 'none',
    splitRatio: 0.5,
    swapSides: false,
  });

  const { addHistory } = useHistory();
  const { createNote } = useNotes();
  const [splitNoteId, setSplitNoteId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize browser tabs with electron API or fallback
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    if (window.electronAPI) {
      // Listen to tab updates
      const unsubUpdate = window.electronAPI.onTabUpdated((updatedTab) => {
        setTabs((prev) =>
          prev.map((t) => (t.id === updatedTab.id ? { ...t, ...updatedTab } : t))
        );

        // Record history if stopped loading and valid URL
        if (!updatedTab.isLoading && updatedTab.url && !updatedTab.url.startsWith('about:')) {
          addHistory({ title: updatedTab.title || updatedTab.url, url: updatedTab.url });
        }
      });

      const unsubCreate = window.electronAPI.onTabCreated((createdTab) => {
        setTabs((prev) => {
          if (prev.some((t) => t.id === createdTab.id)) return prev;
          return [...prev, createdTab];
        });
        setActiveTabId(createdTab.id);
      });

      const unsubClose = window.electronAPI.onTabClosed((closedTabId) => {
        setTabs((prev) => prev.filter((t) => t.id !== closedTabId));
      });

      unsubs = [unsubUpdate, unsubCreate, unsubClose];

      // Show views and create initial tab if none exist
      window.electronAPI.showWebViews();
      window.electronAPI.createTab('https://www.google.com').then((id) => {
        setActiveTabId(id);
      });
    } else {
      // Fallback for browser preview environment
      const mockTab: TabState = {
        id: 'mock-1',
        url: 'https://www.google.com',
        title: 'Google',
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
      };
      setTabs([mockTab]);
      setActiveTabId('mock-1');
    }

    return () => {
      unsubs.forEach((u) => u());
      window.electronAPI?.hideWebViews();
    };
  }, []);

  // Update native WebContentsView bounds whenever container resizes or splitConfig changes
  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current || !window.electronAPI) return;
      const rect = containerRef.current.getBoundingClientRect();

      window.electronAPI.updateViewBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        split: splitConfig,
      });
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateBounds);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, [splitConfig, activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  const handleCreateTab = (url = 'https://www.google.com') => {
    if (window.electronAPI) {
      window.electronAPI.createTab(url);
    }
  };

  const handleCloseTab = (tabId: string) => {
    if (window.electronAPI) {
      window.electronAPI.closeTab(tabId);
    } else {
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
    }
  };

  const handleSwitchTab = (tabId: string) => {
    setActiveTabId(tabId);
    if (window.electronAPI) {
      window.electronAPI.switchTab(tabId);
    }
  };

  const handleNavigate = (url: string) => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.navigateTab(activeTabId, url);
    }
  };

  const handleGoBack = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.goBack(activeTabId);
    }
  };

  const handleGoForward = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.goForward(activeTabId);
    }
  };

  const handleReload = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.reloadTab(activeTabId);
    }
  };

  const handleStop = () => {
    if (activeTabId && window.electronAPI) {
      window.electronAPI.stopTab(activeTabId);
    }
  };

  const handleToggleSplit = (mode: 'none' | 'split-a' | 'split-b') => {
    if (mode === 'none') {
      setSplitConfig({ enabled: false, mode: 'none', splitRatio: 0.5 });
    } else if (mode === 'split-a') {
      // Split Mode A: Browser + Note
      setSplitConfig((prev) => ({
        ...prev,
        enabled: true,
        mode: 'split-a',
        splitRatio: prev.splitRatio || 0.5,
      }));
    } else if (mode === 'split-b') {
      // Split Mode B: Dual Web
      // Pick or create secondary tab
      const otherTab = tabs.find((t) => t.id !== activeTabId);
      const secondaryId = otherTab ? otherTab.id : undefined;

      setSplitConfig((prev) => ({
        ...prev,
        enabled: true,
        mode: 'split-b',
        secondaryTabId: secondaryId,
        splitRatio: prev.splitRatio || 0.5,
      }));
    }
  };

  const handleSwapSides = () => {
    setSplitConfig((prev) => ({
      ...prev,
      swapSides: !prev.swapSides,
    }));
  };

  const handleCreateNoteFromPage = async (pageTitle: string, pageUrl: string) => {
    try {
      const newNote = await createNote({
        title: `Notatka: ${pageTitle}`,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: pageTitle }],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Źródło: ' },
                {
                  type: 'text',
                  marks: [{ type: 'link', attrs: { href: pageUrl } }],
                  text: pageUrl,
                },
              ],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Kluczowe spostrzeżenia ze strony:' }],
            },
          ],
        },
      });

      setSplitNoteId(newNote.id);
      // Automatically enable Split Mode A (Web + Notes)!
      setSplitConfig({
        enabled: true,
        mode: 'split-a',
        splitRatio: 0.5,
        swapSides: false,
      });
    } catch (err) {
      console.error('[BrowserView] Failed to create note from page:', err);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* 1. Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={handleSwitchTab}
        onCloseTab={handleCloseTab}
        onCreateTab={() => handleCreateTab()}
        splitConfig={splitConfig}
        onToggleSplit={handleToggleSplit}
      />

      {/* 2. Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onStop={handleStop}
        onCreateNoteFromPage={handleCreateNoteFromPage}
      />

      {/* 3. Split Controls Bar (visible when split is active) */}
      {splitConfig.enabled && splitConfig.mode !== 'none' && (
        <div className="h-7 bg-surface-elevated/70 border-b border-border-subtle px-4 flex items-center justify-between text-xs text-text-muted select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent-light">
              {splitConfig.mode === 'split-a'
                ? 'Tryb A: Przeglądarka + Notatka'
                : 'Tryb B: Dwie strony internetowe'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSwapSides}
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="Zamień panele stronami"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Zamień strony</span>
            </button>

            <button
              onClick={() => handleToggleSplit('none')}
              className="hover:text-white transition-colors"
            >
              Zamknij split
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Viewport & Split Panels Container */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden flex">
        {/*
          When Split Mode A is active, React renders the Note Editor on one half.
          The native WebContentsView is automatically sized by Electron to occupy the other half!
        */}
        {splitConfig.enabled && splitConfig.mode === 'split-a' && (
          <div
            className={`h-full border-l border-border-subtle overflow-hidden ${
              splitConfig.swapSides ? 'order-first' : 'order-last'
            }`}
            style={{ width: `${(1 - (splitConfig.splitRatio || 0.5)) * 100}%` }}
          >
            <NotesView initialNoteId={splitNoteId || undefined} />
          </div>
        )}

        {/*
          Placeholder visible only if not running inside Electron
        */}
        {!window.electronAPI && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
            <p className="text-base font-semibold text-white">
              Wbudowany silnik przeglądarki DayFlow
            </p>
            <p className="text-xs text-text-muted max-w-md mt-1">
              W natywnej aplikacji Windows EXE, w tym miejscu wyświetlany jest natywny WebContentsView z pełną akceleracją sprzętową Chromium i izolacją procesów.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-surface-elevated text-xs font-mono text-accent-light">
              URL: {activeTab?.url || 'https://www.google.com'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
