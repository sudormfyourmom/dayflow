import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

const OFFLINE_MODE_KEY = 'dayflow.offline-mode';
let offlineMode = false;
try {
  offlineMode = typeof localStorage !== 'undefined' && localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
} catch {
  // A restricted renderer can still use offline mode for the current session.
}

const MOCK_OFFLINE_USER: User = {
  id: 'offline-user',
  app_metadata: {},
  user_metadata: { full_name: 'Użytkownik Offline' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'offline@dayflow.local',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const MOCK_OFFLINE_SESSION: Session = {
  access_token: 'mock-offline-token',
  refresh_token: 'mock-offline-refresh',
  expires_in: 999999999,
  token_type: 'bearer',
  user: MOCK_OFFLINE_USER,
};

export const authService = {
  isOfflineMode(): boolean {
    return offlineMode;
  },

  setOfflineMode(enabled: boolean): void {
    offlineMode = enabled;
    try {
      if (enabled) localStorage.setItem(OFFLINE_MODE_KEY, 'true');
      else localStorage.removeItem(OFFLINE_MODE_KEY);
    } catch {
      // Offline mode remains available for this session if storage is unavailable.
    }
  },

  getOfflineSession(): Session {
    return MOCK_OFFLINE_SESSION;
  },

  getOfflineUser(): User {
    return MOCK_OFFLINE_USER;
  },

  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    offlineMode = false;
    return data;
  },

  async signOut() {
    offlineMode = false;
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore if offline
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getSession(): Promise<Session | null> {
    if (offlineMode) {
      return MOCK_OFFLINE_SESSION;
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser(): Promise<User | null> {
    if (offlineMode) {
      return MOCK_OFFLINE_USER;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};
