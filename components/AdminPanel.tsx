import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Eye, RefreshCw, ShieldCheck, Trash2, UserCog, Users } from 'lucide-react';
import { AdminUser, TrafficEvent } from '../types';
import { Button } from './Button';

interface AdminPanelProps {
  onPlay: () => void;
  onDashboard: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
};

const compactBrowser = (event: TrafficEvent) =>
  [event.platform, event.browserLanguage, event.viewport, event.browserTimezone].filter(Boolean).join(' · ') || 'Sin datos';

interface EditForm {
  user: AdminUser;
  playerName: string;
  isAdmin: boolean;
  password: string;
  saving: boolean;
  formError: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onPlay, onDashboard }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [traffic, setTraffic] = useState<TrafficEvent[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedInputs, setSelectedInputs] = useState<TrafficEvent[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadAdminData = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const [usersResponse, trafficResponse] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'same-origin' }),
        fetch('/api/admin/traffic?limit=220', { credentials: 'same-origin' }),
      ]);
      const [usersPayload, trafficPayload] = await Promise.all([
        usersResponse.json(),
        trafficResponse.json(),
      ]);
      if (!usersResponse.ok) throw new Error(usersPayload.error ?? 'No se pudieron cargar los usuarios.');
      if (!trafficResponse.ok) throw new Error(trafficPayload.error ?? 'No se pudo cargar el tráfico.');
      setUsers(usersPayload.users ?? []);
      setTraffic(trafficPayload.traffic ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando el panel admin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserInputs = async (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedInputs([]);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/inputs`, { credentials: 'same-origin' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'No se pudieron cargar los inputs.');
      setSelectedInputs(payload.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando inputs del usuario.');
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditing({
      user,
      playerName: user.playerName,
      isAdmin: user.isAdmin,
      password: '',
      saving: false,
      formError: '',
    });
  };

  const submitEdit = async () => {
    if (!editing) return;
    setEditing({ ...editing, saving: true, formError: '' });
    try {
      const body: Record<string, unknown> = {};
      if (editing.playerName.trim() !== editing.user.playerName) body.playerName = editing.playerName.trim();
      if (editing.isAdmin !== editing.user.isAdmin) body.isAdmin = editing.isAdmin;
      if (editing.password.trim().length > 0) body.password = editing.password;
      if (Object.keys(body).length === 0) {
        setEditing({ ...editing, saving: false, formError: 'No hay cambios para guardar.' });
        return;
      }
      const res = await fetch(`/api/admin/users/${editing.user.id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'No se pudo actualizar el usuario.');
      setEditing(null);
      await loadAdminData();
    } catch (err) {
      setEditing((curr) => curr ? { ...curr, saving: false, formError: err instanceof Error ? err.message : 'Error.' } : curr);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!window.confirm(`¿Borrar a "${user.playerName}"? Su histórico de partidas y tráfico se conservará anónimo.`)) {
      return;
    }
    setDeletingId(user.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? 'No se pudo borrar el usuario.');
      if (selectedUser?.id === user.id) setSelectedUser(null);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error borrando el usuario.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-arcade text-xs text-purple-300 mb-3 flex items-center gap-2">
            <ShieldCheck size={16} />
            Panel de iClexi
          </p>
          <h1 className="font-arcade text-2xl sm:text-3xl text-white leading-relaxed">Admin del Terror</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Vista de tráfico técnico, navegadores, usuarios y controles del juego. No registra contraseñas ni campos sensibles.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" onClick={onDashboard}>
            Panel normal
          </Button>
          <Button type="button" onClick={onPlay} variant="success">
            Jugar
          </Button>
          <Button type="button" onClick={loadAdminData} disabled={isLoading}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-950/70 p-4 text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-xl border-4 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 border-b-4 border-slate-700 bg-slate-800 px-4 py-3">
            <Users size={20} className="text-retro-accent" />
            <h2 className="font-arcade text-sm text-retro-accent">Usuarios</h2>
          </div>
          <div className="grid gap-3 p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border-2 border-slate-700 bg-slate-950 p-4 transition hover:border-retro-accent"
              >
                <button
                  type="button"
                  onClick={() => void loadUserInputs(user)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{user.playerName}</p>
                      <p className="mt-1 text-xs text-slate-400">Login: {formatDate(user.lastLoginAt)}</p>
                    </div>
                    <span className={`rounded px-2 py-1 text-[10px] font-arcade ${user.isAdmin ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded bg-slate-800 px-3 py-2 text-green-300">Mejor: {user.bestScore}</span>
                    <span className="rounded bg-slate-800 px-3 py-2 text-yellow-300">Partidas: {user.games}</span>
                  </div>
                </button>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(user)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded border-2 border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-retro-accent hover:text-white"
                  >
                    <UserCog size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteUser(user)}
                    disabled={deletingId === user.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded border-2 border-red-700 bg-red-950 px-3 py-2 text-xs font-bold text-red-200 transition hover:border-red-400 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    {deletingId === user.id ? 'Borrando…' : 'Borrar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border-4 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 border-b-4 border-slate-700 bg-slate-800 px-4 py-3">
            <Activity size={20} className="text-retro-accent" />
            <h2 className="font-arcade text-sm text-retro-accent">Tráfico reciente</h2>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-3 sm:p-4 space-y-3">
            {traffic.map((event) => (
              <article key={event.id} className="rounded-lg border-2 border-slate-700 bg-slate-950 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-blue-600 px-2 py-1 text-[10px] font-arcade text-white">{event.eventType}</span>
                      <span className="text-xs text-slate-400">{formatDate(event.createdAt)}</span>
                      <span className="text-xs text-slate-500">HTTP {event.statusCode ?? '?'}</span>
                    </div>
                    <p className="mt-2 truncate font-bold text-white">{event.playerName ?? 'Anónimo'}</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-400">
                      {event.method ?? 'GET'} {event.path ?? '/'}
                    </p>
                  </div>
                  <div className="rounded bg-slate-800 px-3 py-2 text-xs text-slate-300 lg:max-w-md">
                    <p className="break-all font-mono">{event.requestIp ?? 'sin ip'}</p>
                    <p className="mt-1 break-words text-slate-400">{compactBrowser(event)}</p>
                  </div>
                </div>
                <p className="mt-3 max-h-16 overflow-y-auto rounded bg-black/30 p-2 font-mono text-[11px] leading-relaxed text-slate-500">
                  {event.userAgent ?? 'Sin user-agent'}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border-4 border-retro-accent bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b-4 border-slate-700 p-5">
              <div>
                <p className="font-arcade text-xs text-retro-accent">Editar usuario</p>
                <h3 className="mt-2 text-xl font-bold text-white">{editing.user.playerName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded bg-slate-800 px-3 py-1.5 text-sm font-bold text-white hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
            <form
              onSubmit={(ev) => { ev.preventDefault(); void submitEdit(); }}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1 block text-xs font-arcade text-retro-accent">Nombre</label>
                <input
                  type="text"
                  value={editing.playerName}
                  onChange={(ev) => setEditing({ ...editing, playerName: ev.target.value })}
                  className="w-full rounded border-2 border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-retro-accent"
                  minLength={2}
                  maxLength={40}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-arcade text-retro-accent">Rol</label>
                <div className="grid grid-cols-2 gap-2 rounded border-2 border-slate-700 bg-slate-900 p-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!editing.isAdmin}
                    onClick={() => setEditing({ ...editing, isAdmin: false })}
                    className={`rounded px-3 py-2 font-arcade text-xs transition ${
                      !editing.isAdmin
                        ? 'bg-slate-700 text-white shadow-inner'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editing.isAdmin}
                    onClick={() => setEditing({ ...editing, isAdmin: true })}
                    className={`rounded px-3 py-2 font-arcade text-xs transition ${
                      editing.isAdmin
                        ? 'bg-purple-600 text-white shadow-[0_0_0_2px_rgba(192,132,252,0.55)]'
                        : 'text-purple-300 hover:text-purple-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-arcade text-retro-accent">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  value={editing.password}
                  onChange={(ev) => setEditing({ ...editing, password: ev.target.value })}
                  placeholder="Dejar vacío para no cambiar"
                  className="w-full rounded border-2 border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-retro-accent"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
                <p className="mt-1 text-[11px] text-slate-500">Mínimo 8 caracteres. Sólo si quieres resetearla.</p>
              </div>
              {editing.formError && (
                <p className="rounded border-2 border-red-500 bg-red-950/70 p-3 text-sm text-red-100">{editing.formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded border-2 border-slate-700 bg-slate-900 py-2 text-sm font-bold text-slate-200 hover:border-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editing.saving}
                  className="flex-1 rounded border-2 border-retro-accent bg-purple-700 py-2 text-sm font-bold text-white hover:bg-purple-600 disabled:opacity-60"
                >
                  {editing.saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl rounded-xl border-4 border-retro-accent bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b-4 border-slate-700 p-5">
              <div>
                <p className="font-arcade text-xs text-retro-accent">Inputs del juego</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{selectedUser.playerName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-3">
              {selectedInputs.length === 0 && (
                <p className="rounded-lg bg-slate-900 p-5 text-center text-slate-400">
                  Este usuario todavía no tiene eventos de controles registrados.
                </p>
              )}
              {selectedInputs.map((event) => (
                <article key={event.id} className="rounded-lg border-2 border-slate-700 bg-slate-900 p-4">
                  <p className="mb-3 text-xs text-slate-400">{formatDate(event.createdAt)} · {event.viewport ?? 'viewport ?'}</p>
                  <div className="flex flex-wrap gap-2">
                    {event.inputEvents.map((input, index) => (
                      <span key={`${event.id}-${index}`} className="rounded bg-slate-800 px-3 py-2 font-mono text-xs text-green-300">
                        {input.action ?? input.type}:{input.key ?? input.code ?? '-'}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
