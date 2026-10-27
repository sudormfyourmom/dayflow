import { BrowserWindow, WebContentsView } from 'electron';
import { BrowserSecurity } from './BrowserSecurity';

export interface TabData {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface SplitBoundsConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  split?: {
    enabled: boolean;
    mode: 'none' | 'split-a' | 'split-b';
    secondaryTabId?: string;
    splitRatio?: number;
    swapSides?: boolean;
  };
}

export class BrowserManager {
  private mainWindow: BrowserWindow;
  private tabs: Map<string, { view: WebContentsView; data: TabData }> = new Map();
  private activeTabId: string | null = null;
  private secondaryTabId: string | null = null;
  private currentBounds: SplitBoundsConfig | null = null;
  private isVisible: boolean = false;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  public createTab(initialUrl = 'https://www.google.com'): string {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const url = BrowserSecurity.isValidWebUrl(initialUrl)
      ? initialUrl
      : BrowserSecurity.normalizeUrlOrSearch(initialUrl);

    const view = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    const tabData: TabData = {
      id: tabId,
      url,
      title: 'New Tab',
      isLoading: true,
      canGoBack: false,
      canGoForward: false,
    };

    this.tabs.set(tabId, { view, data: tabData });

    // Attach security and navigation handlers
    this.setupViewHandlers(tabId, view);

    // Load initial URL
    view.webContents.loadURL(url).catch((err) => {
      console.warn(`[BrowserManager] Failed to load URL ${url}:`, err.message);
    });

    // Notify renderer
    this.notifyRenderer('tab-created', tabData);

    // If no active tab, make this the active tab
    if (!this.activeTabId) {
      this.switchTab(tabId);
    }

    return tabId;
  }

  private setupViewHandlers(tabId: string, view: WebContentsView): void {
    const contents = view.webContents;

    // Security: handle new window requests -> open in new DayFlow tab or shell
    contents.setWindowOpenHandler((details) => {
      if (BrowserSecurity.isValidWebUrl(details.url)) {
        this.createTab(details.url);
      }
      return { action: 'deny' };
    });

    // Security: navigation guard
    contents.on('will-navigate', (event, navigationUrl) => {
      if (!BrowserSecurity.handleExternalNavigation(navigationUrl)) {
        event.preventDefault();
      }
    });

    // Event updates
    contents.on('did-start-loading', () => {
      const entry = this.tabs.get(tabId);
      if (entry) {
        entry.data.isLoading = true;
        this.emitTabUpdate(tabId);
      }
    });

    contents.on('did-stop-loading', () => {
      const entry = this.tabs.get(tabId);
      if (entry) {
        entry.data.isLoading = false;
        entry.data.canGoBack = contents.canGoBack();
        entry.data.canGoForward = contents.canGoForward();
        entry.data.url = contents.getURL();
        this.emitTabUpdate(tabId);
      }
    });

    contents.on('page-title-updated', (_event, title) => {
      const entry = this.tabs.get(tabId);
      if (entry) {
        entry.data.title = title || 'Untitled';
        this.emitTabUpdate(tabId);
      }
    });

    contents.on('page-favicon-updated', (_event, favicons) => {
      const entry = this.tabs.get(tabId);
      if (entry && favicons.length > 0) {
        entry.data.favicon = favicons[0];
        this.emitTabUpdate(tabId);
      }
    });
  }

  private emitTabUpdate(tabId: string): void {
    const entry = this.tabs.get(tabId);
    if (entry) {
      this.notifyRenderer('tab-updated', entry.data);
    }
  }

  private notifyRenderer(channel: string, payload: unknown): void {
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, payload);
    }
  }

  public switchTab(tabId: string): void {
    if (!this.tabs.has(tabId)) return;
    this.activeTabId = tabId;
    this.applyLayout();
  }

  public closeTab(tabId: string): void {
    const entry = this.tabs.get(tabId);
    if (!entry) return;

    // Detach view from window
    try {
      this.mainWindow.contentView.removeChildView(entry.view);
    } catch {
      // Ignore if not currently attached
    }

    this.tabs.delete(tabId);
    this.notifyRenderer('tab-closed', tabId);

    if (this.secondaryTabId === tabId) {
      this.secondaryTabId = null;
    }

    if (this.activeTabId === tabId) {
      const remainingIds = Array.from(this.tabs.keys());
      if (remainingIds.length > 0) {
        this.switchTab(remainingIds[remainingIds.length - 1]);
      } else {
        this.activeTabId = null;
      }
    }

    this.applyLayout();
  }

  public navigateTab(tabId: string, rawInput: string): void {
    const entry = this.tabs.get(tabId);
    if (!entry) return;

    const targetUrl = BrowserSecurity.normalizeUrlOrSearch(rawInput);
    entry.data.url = targetUrl;
    entry.view.webContents.loadURL(targetUrl).catch((err) => {
      console.warn(`[BrowserManager] Load URL error: ${err.message}`);
    });
    this.emitTabUpdate(tabId);
  }

  public goBack(tabId: string): void {
    const entry = this.tabs.get(tabId);
    if (entry && entry.view.webContents.canGoBack()) {
      entry.view.webContents.goBack();
    }
  }

  public goForward(tabId: string): void {
    const entry = this.tabs.get(tabId);
    if (entry && entry.view.webContents.canGoForward()) {
      entry.view.webContents.goForward();
    }
  }

  public reloadTab(tabId: string): void {
    const entry = this.tabs.get(tabId);
    if (entry) {
      entry.view.webContents.reload();
    }
  }

  public stopTab(tabId: string): void {
    const entry = this.tabs.get(tabId);
    if (entry) {
      entry.view.webContents.stop();
    }
  }

  public updateBounds(boundsConfig: SplitBoundsConfig): void {
    this.currentBounds = boundsConfig;
    this.applyLayout();
  }

  public showWebViews(): void {
    this.isVisible = true;
    this.applyLayout();
  }

  public hideWebViews(): void {
    this.isVisible = false;
    // Remove all views from contentView when user is on dashboard, notes, settings, etc.
    for (const [, { view }] of this.tabs) {
      try {
        this.mainWindow.contentView.removeChildView(view);
      } catch {
        // Safe ignore
      }
    }
  }

  private applyLayout(): void {
    if (!this.isVisible || !this.currentBounds) {
      return;
    }

    const { x, y, width, height, split } = this.currentBounds;
    if (width <= 0 || height <= 0) return;

    // Clean up views that are not currently displayed
    const activeView = this.activeTabId ? this.tabs.get(this.activeTabId)?.view : null;
    const secondaryViewId = split?.secondaryTabId;
    const secondaryView = secondaryViewId ? this.tabs.get(secondaryViewId)?.view : null;

    for (const [id, { view }] of this.tabs) {
      const isNeeded = id === this.activeTabId || (split?.enabled && split.mode === 'split-b' && id === secondaryViewId);
      if (!isNeeded) {
        try {
          this.mainWindow.contentView.removeChildView(view);
        } catch {
          // Ignore
        }
      }
    }

    if (!activeView) return;

    const ratio = Math.max(0.15, Math.min(0.85, split?.splitRatio ?? 0.5));

    if (!split?.enabled || split.mode === 'none') {
      // Single full-size web view
      this.attachView(activeView, { x, y, width, height });
    } else if (split.mode === 'split-a') {
      // Split Mode A: Browser + Note Editor
      // The browser occupies one half, React renders the Note Editor in the other half!
      const webWidth = Math.round(width * ratio);
      const isSwapped = split.swapSides ?? false;

      const webBounds = isSwapped
        ? { x: x + (width - webWidth), y, width: webWidth, height }
        : { x, y, width: webWidth, height };

      this.attachView(activeView, webBounds);
    } else if (split.mode === 'split-b') {
      // Split Mode B: Dual Web views
      const leftWidth = Math.round(width * ratio);
      const rightWidth = width - leftWidth;

      this.attachView(activeView, { x, y, width: leftWidth, height });

      if (secondaryView) {
        this.attachView(secondaryView, { x: x + leftWidth, y, width: rightWidth, height });
      }
    }
  }

  private attachView(view: WebContentsView, bounds: { x: number; y: number; width: number; height: number }): void {
    try {
      this.mainWindow.contentView.addChildView(view);
    } catch {
      // Already a child
    }
    view.setBounds(bounds);
  }

  public getTabs(): TabData[] {
    return Array.from(this.tabs.values()).map((t) => t.data);
  }

  public cleanup(): void {
    for (const [, { view }] of this.tabs) {
      try {
        this.mainWindow.contentView.removeChildView(view);
      } catch {
        // Ignore
      }
    }
    this.tabs.clear();
  }
}
