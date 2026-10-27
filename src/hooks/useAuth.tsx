import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { ProfileRow } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isConfigured: boolean;
  isOffline: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableOfflineMode: () => void;
  exitOfflineMode: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(
    authService.isOfflineMode() || !isSupabaseConfigured
  );

  const fetchProfile = async () => {
    try {
      const prof = await settingsService.getProfile();
      setProfile(prof);
    } catch (err) {
      console.warn('[useAuth] Could not fetch profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      authService.setOfflineMode(true);
      setIsOffline(true);
      setSession(authService.getOfflineSession());
      setUser(authService.getOfflineUser());
      fetchProfile();
      setIsLoading(false);
      return;
    }

    if (isOffline) {
      setSession(authService.getOfflineSession());
      setUser(authService.getOfflineUser());
      fetchProfile();
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      }
      setIsLoading(false);
    }).catch((err) => {
      console.warn('[useAuth] Supabase unreachable on startup:', err);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isOffline) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile();
        } else {
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isOffline]);

  const enableOfflineMode = () => {
    authService.setOfflineMode(true);
    setIsOffline(true);
    const offlineSession = authService.getOfflineSession();
    const offlineUser = authService.getOfflineUser();
    setSession(offlineSession);
    setUser(offlineUser);
    fetchProfile();
  };

  const exitOfflineMode = () => {
    authService.setOfflineMode(false);
    setIsOffline(false);
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const signIn = async (email: string, pass: string) => {
    setIsOffline(false);
    authService.setOfflineMode(false);
    const res = await authService.signIn(email, pass);
    setSession(res.session);
    setUser(res.user);
    if (res.user) {
      await fetchProfile();
    }
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    setIsOffline(false);
    authService.setOfflineMode(false);
    const res = await authService.signUp(email, pass, name);
    setSession(res.session);
    setUser(res.user);
    if (res.user) {
      await fetchProfile();
    }
  };

  const signOut = async () => {
    if (isOffline) {
      exitOfflineMode();
      return;
    }
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        isOffline,
        signIn,
        signUp,
        signOut,
        enableOfflineMode,
        exitOfflineMode,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
