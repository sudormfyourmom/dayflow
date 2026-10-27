import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { BrowserHistoryRow } from '@/types';
import { authService } from './authService';
import { offlineStore } from '@/lib/offlineStore';

export const historyService = {
  async getHistory(): Promise<BrowserHistoryRow[]> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getHistory();
    }

    try {
      const { data, error } = await supabase
        .from('browser_history')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data as BrowserHistoryRow[]) || [];
    } catch {
      return offlineStore.getHistory();
    }
  },

  async addHistory(title: string, url: string): Promise<BrowserHistoryRow | null> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.addHistory(title, url);
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return offlineStore.addHistory(title, url);

      const { data: settings } = await supabase
        .from('user_settings')
        .select('history_enabled')
        .eq('user_id', userData.user.id)
        .single();

      if (settings && settings.history_enabled === false) {
        return null;
      }

      const { data, error } = await supabase
        .from('browser_history')
        .insert({
          title,
          url,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BrowserHistoryRow;
    } catch {
      return offlineStore.addHistory(title, url);
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      offlineStore.deleteHistory(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('browser_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch {
      offlineStore.deleteHistory(id);
    }
  },

  async clearHistory(): Promise<void> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      offlineStore.clearHistory();
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        offlineStore.clearHistory();
        return;
      }

      const { error } = await supabase
        .from('browser_history')
        .delete()
        .eq('user_id', userData.user.id);

      if (error) throw error;
    } catch {
      offlineStore.clearHistory();
    }
  },
};
