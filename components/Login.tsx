import React, { useState } from 'react';
import { KeyRound, LogIn, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { Button } from './Button';

interface LoginProps {
  onLoginSuccess: (playerName: string, isAdmin: boolean) => void;
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
}

type AuthMode = 'login' | 'register';

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onShowTerms, onShowPrivacy }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && !acceptTerms) {
      setError('Debes aceptar los Términos y Condiciones para registrarte.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(isRegister ? '/api/register' : '/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          password: passwordInput,
          ...(isRegister ? { acceptTerms: true } : {}),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.playerName) {
        setError(payload.error ?? (isRegister ? 'No se pudo crear la cuenta.' : 'Nombre o contraseña inválidos.'));
        return;
      }

      onLoginSuccess(payload.playerName, Boolean(payload.isAdmin));
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card bg-gray-900 p-4 sm:p-8 rounded-xl border-4 border-retro-accent shadow-2xl min-w-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="flex justify-center mb-5">
          <div className="h-14 w-14 rounded-lg border-2 border-retro-accent bg-slate-950 flex items-center justify-center text-retro-accent">
            <ShieldCheck size={30} />
          </div>
        </div>
        <h1 className="text-lg sm:text-2xl font-arcade text-center mb-4 text-white leading-relaxed">PPT del Terror</h1>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 mb-6 sm:mb-8 rounded-lg border-2 border-slate-700 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`min-w-0 flex items-center justify-center gap-1.5 rounded-md px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-arcade transition ${
              mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn size={16} />
            <span className="truncate">Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`min-w-0 flex items-center justify-center gap-1.5 rounded-md px-2 sm:px-3 py-2.5 sm:py-3 text-[10px] sm:text-xs font-arcade transition ${
              mode === 'register' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus size={16} />
            <span className="truncate">Registro</span>
          </button>
        </div>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs font-arcade text-blue-300 flex items-center gap-2" htmlFor="player-name">
              <UserRound size={15} />
              Nombre
            </label>
            <input
              id="player-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded p-3 text-white focus:border-retro-accent outline-none font-mono"
              placeholder="Tu nombre"
              autoComplete="username"
              minLength={2}
              maxLength={40}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-arcade text-red-300 flex items-center gap-2" htmlFor="access-password">
              <KeyRound size={15} />
              Contraseña
            </label>
            <input
              id="access-password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded p-3 text-white focus:border-retro-accent outline-none font-mono"
              placeholder="Contraseña"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          {isRegister && (
            <label className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-300 leading-snug">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-green-500"
              />
              <span>
                Acepto los{' '}
                <button type="button" onClick={onShowTerms} className="text-retro-accent underline hover:text-white">
                  Términos y Condiciones
                </button>{' '}
                y la{' '}
                <button type="button" onClick={onShowPrivacy} className="text-retro-accent underline hover:text-white">
                  Política de Privacidad
                </button>
                .
              </span>
            </label>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded animate-pulse">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-4 disabled:opacity-60 px-3 text-[11px] sm:text-sm" disabled={isSubmitting || (isRegister && !acceptTerms)}>
            <span className="inline-flex min-w-0 items-center justify-center gap-2">
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              <span className="truncate">{isSubmitting ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</span>
            </span>
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onShowTerms} className="hover:text-retro-accent">
            Términos
          </button>
          <span>·</span>
          <button type="button" onClick={onShowPrivacy} className="hover:text-retro-accent">
            Privacidad
          </button>
        </div>
      </div>
    </div>
  );
};
