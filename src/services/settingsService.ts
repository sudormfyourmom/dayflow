import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ProfileRow, UserSettingsRow } from '@/types';
import { authService } from './authService';
import { offlineStore } from '@/lib/offlineStore';

export const settingsService = {
  async getSettings(): Promise<UserSettingsRow | null> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getSettings();
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return offlineStore.getSettings();

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserSettingsRow | null;
    } catch {
      return offlineStore.getSettings();
    }
  },

  async updateSettings(updates: Partial<UserSettingsRow>): Promise<UserSettingsRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.updateSettings(updates);
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return offlineStore.updateSettings(updates);

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserSettingsRow;
    } catch {
      return offlineStore.updateSettings(updates);
    }
  },

  async getProfile(): Promise<ProfileRow | null> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getProfile();
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return offlineStore.getProfile();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileRow | null;
    } catch {
      return offlineStore.getProfile();
    }
  },

  async updateProfile(updates: Partial<ProfileRow>): Promise<ProfileRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.updateProfile(updates);
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return offlineStore.updateProfile(updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userData.user.id)
        .select()
        .single();

      if (error) throw error;
      return data as ProfileRow;
    } catch {
      return offlineStore.updateProfile(updates);
    }
  },
};
