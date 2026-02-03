import React, { useState } from 'react';
import { RIDDLES, VALID_CREDENTIALS } from '../constants';
import { Button } from './Button';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usernameInput.toLowerCase().trim();
    const pass = passwordInput.toLowerCase().trim();

    // Verify against riddles logic first (must match the answer to be the key/value)
    if (user !== RIDDLES.username.answer || pass !== RIDDLES.password.answer) {
        setError('¡Respuestas incorrectas! Piensa como un estudiante bajo presión.');
        return;
    }

    // Check dictionary (Redundant logic based on prompt requirement to have dictionary, 
    // but good for structure if we had multiple valid riddle answers mapped)
    if (VALID_CREDENTIALS[user] === pass) {
      onLoginSuccess();
    } else {
      setError('Error en el sistema académico.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full max-w-5xl mx-auto items-center justify-center p-4 gap-8">
      
      {/* Left Panel: Username Riddle */}
      <div className="flex-1 bg-slate-800 p-8 rounded-xl border-4 border-blue-500 shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-arcade text-blue-400 mb-4">Acertijo de Usuario</h2>
        <div className="bg-slate-900 p-4 rounded mb-4 text-gray-300 italic border-l-4 border-blue-500">
          "{RIDDLES.username.question}"
        </div>
        <p className="text-xs text-gray-500 mb-4">Pista: {RIDDLES.username.hint}</p>
      </div>

      {/* Middle: Login Form */}
      <div className="flex-1 bg-gray-900 p-8 rounded-xl border-4 border-retro-accent shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <h1 className="text-2xl font-arcade text-center mb-8 text-white">Portal Académico</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-arcade text-blue-300">Respuesta 1 (Usuario)</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded p-3 text-white focus:border-retro-accent outline-none font-mono"
              placeholder="¿Quién eres?"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-arcade text-red-300">Respuesta 2 (Contraseña)</label>
            <input
              type="password" // Keeping it password type for effect, though it's a riddle answer
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded p-3 text-white focus:border-retro-accent outline-none font-mono"
              placeholder="¿La respuesta al profe?"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded animate-pulse">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-4">
            Ingresar al Sistema
          </Button>
        </form>
      </div>

      {/* Right Panel: Password Riddle */}
      <div className="flex-1 bg-slate-800 p-8 rounded-xl border-4 border-red-500 shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-arcade text-red-400 mb-4">Acertijo de Acceso</h2>
        <div className="bg-slate-900 p-4 rounded mb-4 text-gray-300 italic border-l-4 border-red-500">
          "{RIDDLES.password.question}"
        </div>
        <p className="text-xs text-gray-500 mb-4">Pista: {RIDDLES.password.hint}</p>
      </div>

    </div>
  );
};