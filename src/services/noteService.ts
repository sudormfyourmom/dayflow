import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { NoteFolderRow, NoteInsert, NoteRow, NoteUpdate } from '@/types';
import { authService } from './authService';
import { offlineStore } from '@/lib/offlineStore';

export const noteService = {
  async getNotes(): Promise<NoteRow[]> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getNotes();
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data as NoteRow[]) || [];
    } catch (err) {
      console.warn('[noteService] Falling back to offline store:', err);
      return offlineStore.getNotes();
    }
  },

  async getNoteById(id: string): Promise<NoteRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      const found = offlineStore.getNotes().find((n) => n.id === id);
      if (!found) throw new Error('Note not found');
      return found;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as NoteRow;
    } catch {
      const found = offlineStore.getNotes().find((n) => n.id === id);
      if (!found) throw new Error('Note not found');
      return found;
    }
  },

  async createNote(note?: Partial<Omit<NoteInsert, 'user_id'>>): Promise<NoteRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.createNote(note || {});
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return offlineStore.createNote(note || {});
      }

      const defaultContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      };

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: note?.title || 'Bez tytułu',
          content: note?.content || defaultContent,
          folder_id: note?.folder_id || null,
          is_pinned: note?.is_pinned || false,
          is_favorite: note?.is_favorite || false,
          is_archived: note?.is_archived || false,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as NoteRow;
    } catch (err) {
      console.warn('[noteService] Failed to create in Supabase, using offline store:', err);
      return offlineStore.createNote(note || {});
    }
  },

  async updateNote(id: string, updates: NoteUpdate): Promise<NoteRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.updateNote(id, updates);
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as NoteRow;
    } catch (err) {
      console.warn('[noteService] Failed to update in Supabase, using offline store:', err);
      return offlineStore.updateNote(id, updates);
    }
  },

  async deleteNote(id: string): Promise<void> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      offlineStore.deleteNote(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('[noteService] Failed to delete in Supabase, using offline store:', err);
      offlineStore.deleteNote(id);
    }
  },

  async getFolders(): Promise<NoteFolderRow[]> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getFolders();
    }

    try {
      const { data, error } = await supabase
        .from('note_folders')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data as NoteFolderRow[]) || [];
    } catch {
      return offlineStore.getFolders();
    }
  },

  async createFolder(name: string): Promise<NoteFolderRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.createFolder(name);
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return offlineStore.createFolder(name);
      }

      const { data, error } = await supabase
        .from('note_folders')
        .insert({
          name,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as NoteFolderRow;
    } catch {
      return offlineStore.createFolder(name);
    }
  },

  async deleteFolder(id: string): Promise<void> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      offlineStore.deleteFolder(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('note_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch {
      offlineStore.deleteFolder(id);
    }
  },
};
