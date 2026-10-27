import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Tabs & Navigation
  createTab: (url?: string) => ipcRenderer.invoke('browser:create-tab', url),
  closeTab: (tabId: string) => ipcRenderer.invoke('browser:close-tab', tabId),
  switchTab: (tabId: string) => ipcRenderer.invoke('browser:switch-tab', tabId),
  navigateTab: (tabId: string, url: string) => ipcRenderer.invoke('browser:navigate-tab', tabId, url),
  goBack: (tabId: string) => ipcRenderer.invoke('browser:go-back', tabId),
  goForward: (tabId: string) => ipcRenderer.invoke('browser:go-forward', tabId),
  reloadTab: (tabId: string) => ipcRenderer.invoke('browser:reload-tab', tabId),
  stopTab: (tabId: string) => ipcRenderer.invoke('browser:stop-tab', tabId),

  // Layout & Bounds
  updateViewBounds: (params: unknown) => ipcRenderer.invoke('browser:update-bounds', params),
  hideWebViews: () => ipcRenderer.invoke('browser:hide-views'),
  showWebViews: () => ipcRenderer.invoke('browser:show-views'),

  // Listeners
  onTabUpdated: (callback: (tab: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, tab: any) => callback(tab);
    ipcRenderer.on('tab-updated', handler);
    return () => {
      ipcRenderer.removeListener('tab-updated', handler);
    };
  },
  onTabCreated: (callback: (tab: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, tab: any) => callback(tab);
    ipcRenderer.on('tab-created', handler);
    return () => {
      ipcRenderer.removeListener('tab-created', handler);
    };
  },
  onTabClosed: (callback: (tabId: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, tabId: string) => callback(tabId);
    ipcRenderer.on('tab-closed', handler);
    return () => {
      ipcRenderer.removeListener('tab-closed', handler);
    };
  },

  // Native Notifications
  sendNotification: (title: string, body: string) =>
    ipcRenderer.invoke('system:send-notification', title, body),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
