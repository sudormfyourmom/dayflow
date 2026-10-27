import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { BookmarkRow } from '@/types';
import { authService } from './authService';
import { offlineStore } from '@/lib/offlineStore';

export const bookmarkService = {
  async getBookmarks(): Promise<BookmarkRow[]> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getBookmarks();
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as BookmarkRow[]) || [];
    } catch {
      return offlineStore.getBookmarks();
    }
  },

  async createBookmark(bookmark: { title: string; url: string; folder?: string; is_pinned?: boolean }): Promise<BookmarkRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.createBookmark(bookmark);
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return offlineStore.createBookmark(bookmark);
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          title: bookmark.title,
          url: bookmark.url,
          folder: bookmark.folder || 'Favorites',
          is_pinned: bookmark.is_pinned ?? false,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BookmarkRow;
    } catch {
      return offlineStore.createBookmark(bookmark);
    }
  },

  async deleteBookmark(id: string): Promise<void> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      offlineStore.deleteBookmark(id);
      return;
    }

    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
    } catch {
      offlineStore.deleteBookmark(id);
    }
  },

  async updateBookmark(id: string, updates: Partial<BookmarkRow>): Promise<BookmarkRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.updateBookmark(id, updates);
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BookmarkRow;
    } catch {
      return offlineStore.updateBookmark(id, updates);
    }
  },
};
