import {
  TaskRow,
  NoteRow,
  NoteFolderRow,
  BookmarkRow,
  BrowserHistoryRow,
  UserSettingsRow,
  ProfileRow,
} from '@/types';

// Initial seed data for offline mode
const INITIAL_TASKS: TaskRow[] = [
  {
    id: 'offline-task-1',
    user_id: 'offline-user',
    title: 'Wypróbuj funkcje DayFlow w trybie offline',
    description: 'Możesz zarządzać zadaniami, edytować notatki w Tiptap i przeglądać strony w podzielonym ekranie.',
    status: 'todo',
    priority: 'high',
    due_date: new Date().toISOString().split('T')[0],
    start_at: new Date(Date.now() + 3600000).toISOString(),
    end_at: new Date(Date.now() + 7200000).toISOString(),
    category: 'Start',
    recurrence_rule: 'none',
    reminder_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  {
    id: 'offline-task-2',
    user_id: 'offline-user',
    title: 'Otwórz podzielony ekran (Split View)',
    description: 'Przejdź do zakładki Przeglądarka i kliknij przycisk „Web + Notatka”.',
    status: 'todo',
    priority: 'normal',
    due_date: new Date().toISOString().split('T')[0],
    start_at: null,
    end_at: null,
    category: 'Przeglądarka',
    recurrence_rule: 'none',
    reminder_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
];

const INITIAL_FOLDERS: NoteFolderRow[] = [
  {
    id: 'offline-folder-1',
    user_id: 'offline-user',
    name: 'Osobiste',
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'offline-folder-2',
    user_id: 'offline-user',
    name: 'Pomysły i Projekty',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_NOTES: NoteRow[] = [
  {
    id: 'offline-note-1',
    user_id: 'offline-user',
    folder_id: 'offline-folder-1',
    title: 'Witaj w DayFlow (Tryb Offline)',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Witaj w DayFlow!' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Pracujesz obecnie w trybie lokalnym offline. Twoje notatki, zadania i zakładki są w pełni dostępne bez połączenia z internetem.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Najważniejsze funkcje:' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Edytor tekstu Tiptap z automatycznym zapisem.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Wbudowana wielozakładkowa przeglądarka internetowa.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Podzielony ekran: przeglądanie strony i pisanie notatek obok siebie.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Wyszukiwanie globalne dostępne pod skrótem Ctrl + K.' }],
                },
              ],
            },
          ],
        },
      ],
    },
    is_pinned: true,
    is_favorite: true,
    is_archived: false,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
];

const INITIAL_BOOKMARKS: BookmarkRow[] = [
  {
    id: 'offline-bm-1',
    user_id: 'offline-user',
    title: 'Google',
    url: 'https://www.google.com',
    folder: 'Ulubione',
    is_pinned: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'offline-bm-2',
    user_id: 'offline-user',
    title: 'GitHub',
    url: 'https://github.com',
    folder: 'Ulubione',
    is_pinned: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'offline-bm-3',
    user_id: 'offline-user',
    title: 'Wikipedia',
    url: 'https://pl.wikipedia.org',
    folder: 'Encyklopedia',
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: UserSettingsRow = {
  id: 'offline-settings-1',
  user_id: 'offline-user',
  theme: 'dark',
  start_of_week: 1,
  date_format: 'YYYY-MM-DD',
  time_format: '24h',
  timezone: 'UTC',
  default_view: 'dashboard',
  notifications_enabled: true,
  browser_homepage: 'https://www.google.com',
  search_engine: 'https://www.google.com/search?q=',
  history_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_PROFILE: ProfileRow = {
  id: 'offline-user',
  display_name: 'Użytkownik Offline',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

class OfflineStore {
  private tasks: TaskRow[] = [...INITIAL_TASKS];
  private folders: NoteFolderRow[] = [...INITIAL_FOLDERS];
  private notes: NoteRow[] = [...INITIAL_NOTES];
  private bookmarks: BookmarkRow[] = [...INITIAL_BOOKMARKS];
  private history: BrowserHistoryRow[] = [];
  private settings: UserSettingsRow = { ...INITIAL_SETTINGS };
  private profile: ProfileRow = { ...INITIAL_PROFILE };

  private readonly storageKey = 'dayflow.offline.v1';

  constructor() {
    this.restore();
  }

  private restore(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data && data.version === 1) {
        this.tasks = Array.isArray(data.tasks) ? data.tasks : this.tasks;
        this.folders = Array.isArray(data.folders) ? data.folders : this.folders;
        this.notes = Array.isArray(data.notes) ? data.notes : this.notes;
        this.bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : this.bookmarks;
        this.history = Array.isArray(data.history) ? data.history : this.history;
        this.settings = data.settings || this.settings;
        this.profile = data.profile || this.profile;
      }
    } catch (error) {
      console.warn('[offlineStore] Could not restore local data:', error);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        version: 1,
        tasks: this.tasks,
        folders: this.folders,
        notes: this.notes,
        bookmarks: this.bookmarks,
        history: this.history,
        settings: this.settings,
        profile: this.profile,
      }));
    } catch (error) {
      console.warn('[offlineStore] Could not persist local data:', error);
    }
  }

  // Tasks
  public getTasks(): TaskRow[] {
    return [...this.tasks].filter((t) => !t.deleted_at);
  }

  public createTask(task: Partial<TaskRow>): TaskRow {
    const newTask: TaskRow = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: 'offline-user',
      title: task.title || 'Nowe zadanie',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'normal',
      due_date: task.due_date || null,
      start_at: task.start_at || null,
      end_at: task.end_at || null,
      category: task.category || 'General',
      recurrence_rule: task.recurrence_rule || 'none',
      reminder_at: task.reminder_at || null,
      completed_at: task.completed_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    this.tasks.unshift(newTask);
    this.persist();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<TaskRow>): TaskRow {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.tasks[index];
  }

  public deleteTask(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persist();
  }

  // Notes
  public getNotes(): NoteRow[] {
    return [...this.notes].filter((n) => !n.deleted_at);
  }

  public createNote(note: Partial<NoteRow>): NoteRow {
    const newNote: NoteRow = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: 'offline-user',
      folder_id: note.folder_id || null,
      title: note.title || 'Bez tytułu',
      content: note.content || { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
      is_pinned: note.is_pinned ?? false,
      is_favorite: note.is_favorite ?? false,
      is_archived: note.is_archived ?? false,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    this.notes.unshift(newNote);
    this.persist();
    return newNote;
  }

  public updateNote(id: string, updates: Partial<NoteRow>): NoteRow {
    const index = this.notes.findIndex((n) => n.id === id);
    if (index === -1) throw new Error('Note not found');
    this.notes[index] = {
      ...this.notes[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.notes[index];
  }

  public deleteNote(id: string): void {
    this.notes = this.notes.filter((n) => n.id !== id);
    this.persist();
  }

  // Folders
  public getFolders(): NoteFolderRow[] {
    return [...this.folders];
  }

  public createFolder(name: string): NoteFolderRow {
    const folder: NoteFolderRow = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: 'offline-user',
      name,
      sort_order: this.folders.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.folders.push(folder);
    this.persist();
    return folder;
  }

  public deleteFolder(id: string): void {
    this.folders = this.folders.filter((f) => f.id !== id);
    this.persist();
  }

  // Bookmarks
  public getBookmarks(): BookmarkRow[] {
    return [...this.bookmarks];
  }

  public createBookmark(bookmark: Partial<BookmarkRow>): BookmarkRow {
    const newBookmark: BookmarkRow = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: 'offline-user',
      title: bookmark.title || 'Nowa zakładka',
      url: bookmark.url || 'https://google.com',
      folder: bookmark.folder || 'Ulubione',
      is_pinned: bookmark.is_pinned ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.bookmarks.unshift(newBookmark);
    this.persist();
    return newBookmark;
  }

  public updateBookmark(id: string, updates: Partial<BookmarkRow>): BookmarkRow {
    const index = this.bookmarks.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Bookmark not found');
    this.bookmarks[index] = {
      ...this.bookmarks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.bookmarks[index];
  }

  public deleteBookmark(id: string): void {
    this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
    this.persist();
  }

  // History
  public getHistory(): BrowserHistoryRow[] {
    return [...this.history];
  }

  public addHistory(title: string, url: string): BrowserHistoryRow | null {
    if (!this.settings.history_enabled) return null;
    const item: BrowserHistoryRow = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: 'offline-user',
      title,
      url,
      visited_at: new Date().toISOString(),
    };
    this.history.unshift(item);
    if (this.history.length > 200) {
      this.history.pop();
    }
    this.persist();
    return item;
  }

  public deleteHistory(id: string): void {
    this.history = this.history.filter((h) => h.id !== id);
    this.persist();
  }

  public clearHistory(): void {
    this.history = [];
    this.persist();
  }

  // Settings & Profile
  public getSettings(): UserSettingsRow {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<UserSettingsRow>): UserSettingsRow {
    this.settings = {
      ...this.settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return { ...this.settings };
  }

  public getProfile(): ProfileRow {
    return { ...this.profile };
  }

  public updateProfile(updates: Partial<ProfileRow>): ProfileRow {
    this.profile = {
      ...this.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return { ...this.profile };
  }
}

export const offlineStore = new OfflineStore();
