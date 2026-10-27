import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Monitor,
  Bell,
  Globe,
  Download,
  LogOut,
  Check,
  WifiOff,
  Cloud,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const SettingsView: React.FC = () => {
  const { user, profile, signOut, isOffline, exitOfflineMode } = useAuth();
  const { settings, updateSettings, updateProfile } = useSettings();
  const { tasks } = useTasks();
  const { notes } = useNotes();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [theme, setTheme] = useState(settings?.theme || 'dark');
  const [timeFormat, setTimeFormat] = useState(settings?.time_format || '24h');
  const [startOfWeek, setStartOfWeek] = useState(settings?.start_of_week ?? 1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings?.notifications_enabled ?? true
  );
  const [browserHomepage, setBrowserHomepage] = useState(
    settings?.browser_homepage || 'https://www.google.com'
  );
  const [searchEngine, setSearchEngine] = useState(
    settings?.search_engine || 'https://www.google.com/search?q='
  );
  const [historyEnabled, setHistoryEnabled] = useState(settings?.history_enabled ?? true);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || '');
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme);
      setTimeFormat(settings.time_format);
      setStartOfWeek(settings.start_of_week);
      setNotificationsEnabled(settings.notifications_enabled);
      setBrowserHomepage(settings.browser_homepage);
      setSearchEngine(settings.search_engine);
      setHistoryEnabled(settings.history_enabled);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (displayName.trim()) {
        await updateProfile({ display_name: displayName.trim() });
      }

      await updateSettings({
        theme,
        time_format: timeFormat,
        start_of_week: startOfWeek,
        notifications_enabled: notificationsEnabled,
        browser_homepage: browserHomepage,
        search_engine: searchEngine,
        history_enabled: historyEnabled,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('[SettingsView] Error updating settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = () => {
    if (window.electronAPI) {
      window.electronAPI.sendNotification(
        'DayFlow Notification',
        'Powiadomienia systemowe Windows działają prawidłowo!'
      );
    } else {
      alert('Powiadomienie testowe DayFlow: System powiadomień aktywny!');
    }
  };

  const exportAllData = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      user: user?.email,
      tasks,
      notes,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dayflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" />
          Ustawienia
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Zarządzaj swoim profilem, preferencjami interfejsu i synchronizacją
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Profil użytkownika */}
        <div className="p-5 rounded-2xl bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
            <User className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">Profil użytkownika</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Nazwa wyświetlana
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Twoje imię lub nick..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Adres e-mail
              </label>
              <Input value={user?.email || ''} disabled className="opacity-60 bg-surface-elevated" />
            </div>
          </div>
        </div>

        {/* 2. Wygląd i Organizer */}
        <div className="p-5 rounded-2xl bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Monitor className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">Wygląd i Organizer</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Motyw</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="dark">Dark Minimalism (Domyślny)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Format zegara
              </label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="24h">24-godzinny (14:30)</option>
                <option value="12h">12-godzinny (2:30 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Początek tygodnia
              </label>
              <select
                value={startOfWeek}
                onChange={(e) => setStartOfWeek(Number(e.target.value))}
                className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value={1}>Poniedziałek</option>
                <option value={0}>Niedziela</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Przeglądarka sieciowa */}
        <div className="p-5 rounded-2xl bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Globe className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">Wbudowana przeglądarka</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Strona startowa
              </label>
              <Input
                value={browserHomepage}
                onChange={(e) => setBrowserHomepage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Domyślna wyszukiwarka
              </label>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="https://www.google.com/search?q=">Google</option>
                <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
                <option value="https://www.bing.com/search?q=">Bing</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-sm font-medium text-white block">
                Zapisywanie historii przeglądania
              </span>
              <span className="text-xs text-text-muted">
                Po wyłączeniu nowe wizyty nie będą zapisywane w dzienniku historii
              </span>
            </div>
            <input
              type="checkbox"
              checked={historyEnabled}
              onChange={(e) => setHistoryEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-surface text-accent cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Powiadomienia */}
        <div className="p-5 rounded-2xl bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-white">Powiadomienia Windows</h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestNotification}
              className="text-xs h-7"
            >
              Testuj powiadomienie
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-white block">
                Powiadomienia o przypomnieniach zadań
              </span>
              <span className="text-xs text-text-muted">
                Wysyłaj natywne powiadomienia w systemie Windows o zbliżających się terminach
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-surface text-accent cursor-pointer"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-4 h-4" /> Ustawienia zostały zapisane!
            </span>
          ) : (
            <span />
          )}

          <Button type="submit" variant="primary" isLoading={isSaving}>
            Zapisz preferencje
          </Button>
        </div>
      </form>

      {/* 5. Eksport danych & Wersja */}
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
          <Download className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-white">Kopia zapasowa i Eksport</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Eksportuj wszystkie dane (JSON)</p>
            <p className="text-xs text-text-muted">
              Pobierz kopię swoich zadań i notatek do pliku JSON
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={exportAllData}>
            <Download className="w-3.5 h-3.5 mr-1" /> Eksportuj
          </Button>
        </div>
      </div>

      {/* App info */}
      <div className="p-4 rounded-xl bg-surface-elevated/40 border border-border-subtle flex items-center justify-between text-xs text-text-muted">
        <div>
          <span className="font-semibold text-text-secondary">DayFlow Desktop</span> • Wersja 1.0.0
          (Windows x64)
        </div>
        <button
          onClick={signOut}
          className="text-status-danger hover:underline flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Wyloguj się
        </button>
      </div>
    </div>
  );
};
