export interface TabState {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface SplitConfig {
  enabled: boolean;
  mode: 'none' | 'split-a' | 'split-b'; // split-a: Browser + Note; split-b: Dual Browser
  secondaryTabId?: string;
  splitRatio?: number; // 0.1 to 0.9, default 0.5
  swapSides?: boolean; // false = web left, true = web right
}

export interface ElectronAPI {
  // Tabs & Navigation
  createTab: (url?: string) => Promise<string>;
  closeTab: (tabId: string) => Promise<void>;
  switchTab: (tabId: string) => Promise<void>;
  navigateTab: (tabId: string, url: string) => Promise<void>;
  goBack: (tabId: string) => Promise<void>;
  goForward: (tabId: string) => Promise<void>;
  reloadTab: (tabId: string) => Promise<void>;
  stopTab: (tabId: string) => Promise<void>;
  
  // Layout & WebContentsView bounds
  updateViewBounds: (params: {
    x: number;
    y: number;
    width: number;
    height: number;
    split?: SplitConfig;
  }) => Promise<void>;
  hideWebViews: () => Promise<void>;
  showWebViews: () => Promise<void>;

  // Events
  onTabUpdated: (callback: (tab: TabState) => void) => () => void;
  onTabCreated: (callback: (tab: TabState) => void) => () => void;
  onTabClosed: (callback: (tabId: string) => void) => () => void;

  // System & Notifications
  sendNotification: (title: string, body: string) => Promise<boolean>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
