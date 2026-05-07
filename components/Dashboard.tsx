import React, { useEffect, useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { LeaderboardEntry, LeaderboardResponse } from '../types';
import { Button } from './Button';

interface DashboardProps {
  playerName: string;
  onPlay: () => void;
}

const emptyLeaderboard: LeaderboardResponse = {
  topWeek: [],
  topAllTime: [],
};

const formatDate = (value: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const LeaderboardTable: React.FC<{ title: string; entries: LeaderboardEntry[] }> = ({ title, entries }) => (
  <section className="bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl overflow-hidden">
    <div className="bg-slate-800 px-4 py-3 border-b-4 border-slate-700">
      <h2 className="font-arcade text-sm text-retro-accent">{title}</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <thead className="text-xs uppercase text-gray-400 bg-slate-950">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Mejor</th>
            <th className="px-4 py-3">Victorias</th>
            <th className="px-4 py-3">Partidas</th>
            <th className="px-4 py-3">Última</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {entries.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-400" colSpan={6}>
                Sin puntuaciones todavía.
              </td>
            </tr>
          )}
          {entries.map((entry, index) => (
            <tr key={`${entry.playerName}-${index}`} className="text-sm text-gray-200">
              <td className="px-4 py-3 font-arcade text-xs text-yellow-400">{index + 1}</td>
              <td className="px-4 py-3 font-bold">{entry.playerName}</td>
              <td className="px-4 py-3 text-green-400">{entry.bestScore}</td>
              <td className="px-4 py-3">{entry.wins}</td>
              <td className="px-4 py-3">{entry.games}</td>
              <td className="px-4 py-3 text-gray-400">{formatDate(entry.lastPlayedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export const Dashboard: React.FC<DashboardProps> = ({ playerName, onPlay }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>(emptyLeaderboard);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/leaderboard', { credentials: 'same-origin' });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? 'No se pudo cargar el dashboard.');
        return;
      }
      setLeaderboard(payload);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="font-arcade text-xs text-gray-400 mb-3">Jugador: {playerName}</p>
          <h1 className="font-arcade text-2xl md:text-3xl text-white leading-relaxed">Dashboard del Terror</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" onClick={onPlay} variant="success">
            <span className="inline-flex items-center justify-center gap-2">
              <Play size={18} />
              Jugar
            </span>
          </Button>
          <Button type="button" onClick={loadLeaderboard} disabled={isLoading}>
            <span className="inline-flex items-center justify-center gap-2">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Cargando...' : 'Actualizar'}
            </span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/70 border-2 border-red-500 text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <LeaderboardTable title="Top de la semana" entries={leaderboard.topWeek} />
        <LeaderboardTable title="Top de todos los tiempos" entries={leaderboard.topAllTime} />
      </div>
    </div>
  );
};
