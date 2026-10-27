import { Database } from './database';

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type NoteRow = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export type NoteFolderRow = Database['public']['Tables']['note_folders']['Row'];
export type TagRow = Database['public']['Tables']['tags']['Row'];
export type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
export type BrowserHistoryRow = Database['public']['Tables']['browser_history']['Row'];
export type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type ActiveView =
  | 'dashboard'
  | 'today'
  | 'tasks'
  | 'calendar'
  | 'notes'
  | 'browser'
  | 'bookmarks'
  | 'history'
  | 'settings';

export type SplitMode = 'none' | 'split-a' | 'split-b';

export interface SearchResultItem {
  id: string;
  type: 'task' | 'note' | 'bookmark' | 'history';
  title: string;
  subtitle?: string;
  extra?: string;
  item: TaskRow | NoteRow | BookmarkRow | BrowserHistoryRow;
}
