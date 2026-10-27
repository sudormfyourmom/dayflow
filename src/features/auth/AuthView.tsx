import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const AuthView: React.FC = () => {
  const { signIn, signUp, enableOfflineMode, isConfigured } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Wprowadź adres e-mail i hasło');
      return;
    }

    if (password.length < 6) {
      setError('Hasło musi zawierać co najmniej 6 znaków');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        await signUp(email.trim(), password, displayName.trim());
        setSuccessMsg('Konto utworzone! Możesz się teraz zalogować.');
        setIsRegister(false);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      setError(err?.message || 'Błąd autoryzacji. Sprawdź wprowadzone dane.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Branding */}
        <div className="text-center space-y-2">
          <img src="./dayflow-logo.svg" alt="DayFlow" className="w-60 h-auto mx-auto" />
          <p className="text-xs text-text-secondary">
            Twoje osobiste centrum produktywności i zintegrowana przeglądarka
          </p>
        </div>

        {/* Use the local account directly when cloud authentication is unavailable. */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-light">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Konto lokalne</p>
              <p className="text-xs text-text-muted mt-0.5">Twoje dane są zapisywane na tym urządzeniu.</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 text-xs text-emerald-400">
            {successMsg}
          </div>
        )}

        {isConfigured && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Imię i nazwisko</label>
                  <Input
                    icon={<User className="w-4 h-4" />}
                    placeholder="Jan Kowalski"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Adres e-mail</label>
                <Input
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Hasło</label>
                <Input
                  type="password"
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full h-10 mt-2" isLoading={isLoading}>
                <span>{isRegister ? 'Utwórz konto DayFlow' : 'Zaloguj się'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-xs text-accent-light hover:underline font-medium"
              >
                {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się bezpłatnie'}
              </button>
            </div>
          </>
        )}

        {/* Offline Mode Option */}
        <div className="pt-3 border-t border-border-subtle/80 flex flex-col items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            onClick={enableOfflineMode}
            className="w-full text-xs h-9 bg-surface-elevated hover:bg-surface-hover border-border text-white"
          >
            <WifiOff className="w-3.5 h-3.5 mr-2 text-amber-400" />
            <span>{isConfigured ? 'Kontynuuj w trybie offline (Gość)' : 'Wejdź do DayFlow'}</span>
          </Button>
          <span className="text-[11px] text-text-muted text-center">
            {isConfigured ? 'Pracuj lokalnie bez konieczności logowania do chmury' : 'Korzystaj z DayFlow na tym urządzeniu'}
          </span>
        </div>
      </div>
    </div>
  );
};
