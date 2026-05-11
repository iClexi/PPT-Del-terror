import React, { useEffect, useState } from 'react';
import { FileText, LayoutDashboard, Lock, LogOut, RotateCcw, ShieldCheck, Trophy } from 'lucide-react';
import { Login } from './components/Login';
import { Game } from './components/Game';
import { Button } from './components/Button';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';
import { ScreenState } from './types';

const screenFromPath = (): ScreenState | null => {
  if (typeof window === 'undefined') return null;
  const p = window.location.pathname;
  if (p.startsWith('/terminos')) return ScreenState.TERMS;
  if (p.startsWith('/privacidad')) return ScreenState.PRIVACY;
  return null;
};

function App() {
  const initialFromUrl = screenFromPath();
  const [screen, setScreen] = useState<ScreenState>(initialFromUrl ?? ScreenState.LOGIN);
  const [returnScreen, setReturnScreen] = useState<ScreenState>(ScreenState.LOGIN);
  const [finalScore, setFinalScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const [newRecordScore, setNewRecordScore] = useState<number | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/session', { credentials: 'same-origin' });
        const payload = await response.json();
        if (response.ok && payload.authenticated && payload.playerName) {
          setPlayerName(payload.playerName);
          setIsAdmin(Boolean(payload.isAdmin));
          setReturnScreen(ScreenState.DASHBOARD);
          if (screenFromPath() === null) setScreen(ScreenState.DASHBOARD);
        }
      } catch {
        if (screenFromPath() === null) setScreen(ScreenState.LOGIN);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target =
      screen === ScreenState.TERMS ? '/terminos' :
      screen === ScreenState.PRIVACY ? '/privacidad' : '/';
    if (window.location.pathname !== target) {
      try { window.history.replaceState({}, '', target); } catch {}
    }
  }, [screen]);

  const showTerms = () => {
    if (screen !== ScreenState.TERMS && screen !== ScreenState.PRIVACY) setReturnScreen(screen);
    setScreen(ScreenState.TERMS);
  };
  const showPrivacy = () => {
    if (screen !== ScreenState.TERMS && screen !== ScreenState.PRIVACY) setReturnScreen(screen);
    setScreen(ScreenState.PRIVACY);
  };
  const backFromLegal = () => setScreen(returnScreen);

  const handleLoginSuccess = (name: string, admin: boolean) => {
    setPlayerName(name);
    setIsAdmin(admin);
    setReturnScreen(ScreenState.DASHBOARD);
    setScreen(ScreenState.DASHBOARD);
  };

  const handleGameOver = async (won: boolean, score: number) => {
    setFinalScore(score);

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, won }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.isPersonalBest && score > personalBest) {
        setNewRecordScore(score);
      }
      if (response.ok && Number.isFinite(Number(payload.bestScore))) {
        setPersonalBest(Number(payload.bestScore));
      }
    } catch {
      // The game result still renders even if the network is unavailable.
    }

    setScreen(won ? ScreenState.VICTORY : ScreenState.GAME_OVER);
  };

  const resetGame = () => {
    setScreen(ScreenState.PLAYING);
  };

  const showDashboard = () => {
    setScreen(ScreenState.DASHBOARD);
  };

  const showAdmin = () => {
    setScreen(ScreenState.ADMIN);
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch(() => undefined);
    setPlayerName('');
    setIsAdmin(false);
    setPersonalBest(0);
    setScreen(ScreenState.LOGIN);
  };

  const getFeedbackMessage = (score: number, won: boolean) => {
    if (won) return "Héroe de la fe: Lograste enviarlo a las 3:59 PM, el cuatrimestre está a salvo... por ahora.";
    
    if (score === 0) return "Le cayó agua al botón de Enter justo al iniciar.";
    if (score < 300) return "Una banda de atracadores entró y se robó SOLAMENTE el cargador de tu laptop.";
    if (score < 600) return "Tu padrastro estaba en la selva de Colombia y te estresaste demasiado.";
    if (score < 1200) return "Quisiste ser un héroe de la fe, pero el PPT todavía no llegó.";
    return "Duraste bastante. El sistema colapsó porque todos subieron la tarea al mismo tiempo.";
  };

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col">
      <nav className="px-3 py-3 sm:p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center z-50 gap-3">
        <div className="font-arcade text-retro-accent text-base sm:text-lg flex items-center gap-2">
          <img
            src="/favicon.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded border-2 border-retro-accent"
          />
          <span>PPT ATTACK</span>
        </div>
        {screen !== ScreenState.LOGIN && !isCheckingSession && (
          <div className="flex flex-wrap justify-end items-center gap-3">
            {screen !== ScreenState.DASHBOARD && screen !== ScreenState.TERMS && screen !== ScreenState.PRIVACY && (
              <button
                onClick={showDashboard}
                className="text-xs text-gray-400 hover:text-white font-sans inline-flex items-center gap-1"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
            )}
            {isAdmin && screen !== ScreenState.ADMIN && (
              <button
                onClick={showAdmin}
                className="text-xs text-purple-300 hover:text-white font-sans inline-flex items-center gap-1"
              >
                <ShieldCheck size={14} />
                Admin
              </button>
            )}
            <button
              onClick={showTerms}
              className="text-xs text-gray-400 hover:text-white font-sans inline-flex items-center gap-1"
            >
              <FileText size={14} />
              Términos
            </button>
            <button
              onClick={showPrivacy}
              className="text-xs text-gray-400 hover:text-white font-sans inline-flex items-center gap-1"
            >
              <Lock size={14} />
              Privacidad
            </button>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-white font-sans inline-flex items-center gap-1"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>

      <main className={`flex-grow relative min-h-0 ${
        screen === ScreenState.TERMS || screen === ScreenState.PRIVACY
          ? 'overflow-y-auto block'
          : 'overflow-hidden flex items-center justify-center'
      }`}>
        {isCheckingSession && (
          <div className="font-arcade text-retro-accent animate-pulse">Cargando...</div>
        )}
        
        {!isCheckingSession && screen === ScreenState.LOGIN && (
          <Login onLoginSuccess={handleLoginSuccess} onShowTerms={showTerms} onShowPrivacy={showPrivacy} />
        )}

        {screen === ScreenState.TERMS && (
          <Terms onBack={backFromLegal} onPrivacy={showPrivacy} />
        )}

        {screen === ScreenState.PRIVACY && (
          <Privacy onBack={backFromLegal} onTerms={showTerms} />
        )}

        {!isCheckingSession && screen === ScreenState.DASHBOARD && (
          <Dashboard playerName={playerName} isAdmin={isAdmin} onPlay={resetGame} onAdmin={showAdmin} />
        )}

        {!isCheckingSession && screen === ScreenState.ADMIN && isAdmin && (
          <AdminPanel onPlay={resetGame} onDashboard={showDashboard} />
        )}

        {!isCheckingSession && screen === ScreenState.PLAYING && (
          <Game onGameOver={handleGameOver} />
        )}

        {!isCheckingSession && screen === ScreenState.GAME_OVER && (
          <div className="text-center p-5 sm:p-8 bg-slate-800 border-4 border-red-600 rounded-lg shadow-2xl w-[calc(100vw-1.5rem)] max-w-lg mx-3 z-50">
            <h1 className="text-3xl sm:text-4xl font-arcade text-red-500 mb-4 leading-relaxed">¡REPROBADO!</h1>
            <p className="font-sans text-gray-300 mb-6 text-base sm:text-xl">
              {getFeedbackMessage(finalScore, false)}
            </p>
            <div className="font-arcade text-yellow-400 mb-8">Puntaje Final: {finalScore}</div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={resetGame} variant="primary">
                <span className="inline-flex items-center gap-2">
                  <RotateCcw size={18} />
                  Intentar de nuevo
                </span>
              </Button>
              <Button onClick={showDashboard} variant="danger">
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Dashboard
                </span>
              </Button>
            </div>
          </div>
        )}

        {!isCheckingSession && screen === ScreenState.VICTORY && (
          <div className="text-center p-8 bg-slate-800 border-4 border-green-500 rounded-lg shadow-2xl max-w-lg mx-4 z-50">
            <h1 className="text-3xl font-arcade text-green-400 mb-4">¡PPT SUBIDO!</h1>
            <p className="font-sans text-gray-300 mb-6 text-xl">
              {getFeedbackMessage(finalScore, true)}
            </p>
            <div className="font-arcade text-yellow-400 mb-8">Puntaje Final: {finalScore}</div>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="success">
                <span className="inline-flex items-center gap-2">
                  <Trophy size={18} />
                  Jugar otra vez
                </span>
              </Button>
              <Button onClick={showDashboard} variant="primary">
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Dashboard
                </span>
              </Button>
            </div>
          </div>
        )}
      </main>

      {newRecordScore !== null && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border-4 border-yellow-400 bg-slate-950 p-6 text-center shadow-2xl">
            <Trophy className="mx-auto mb-4 text-yellow-400" size={42} />
            <h2 className="font-arcade text-2xl text-yellow-300 leading-relaxed">Nuevo récord</h2>
            <p className="mt-4 text-slate-300">Superaste tu mejor marca con {newRecordScore} puntos.</p>
            <Button className="mt-6 w-full" onClick={() => setNewRecordScore(null)} variant="success">
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
