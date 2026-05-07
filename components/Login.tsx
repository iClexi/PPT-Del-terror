import React, { useState } from 'react';
import { Button } from './Button';

interface LoginProps {
  onLoginSuccess: (playerName: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          password: passwordInput,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.playerName) {
        setError(payload.error ?? 'Nombre o contraseña inválidos.');
        return;
      }

      onLoginSuccess(payload.playerName);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full max-w-5xl mx-auto items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl border-4 border-retro-accent shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <h1 className="text-2xl font-arcade text-center mb-8 text-white leading-relaxed">PPT del Terror</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-arcade text-blue-300" htmlFor="player-name">Nombre</label>
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
            <label className="text-xs font-arcade text-red-300" htmlFor="access-password">Contraseña</label>
            <input
              id="access-password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded p-3 text-white focus:border-retro-accent outline-none font-mono"
              placeholder="Contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded animate-pulse">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-4 disabled:opacity-60" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
};
