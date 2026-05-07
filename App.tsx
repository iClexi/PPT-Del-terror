import React, { useEffect, useState } from 'react';
import { BookOpenCheck, LayoutDashboard, LogOut, RotateCcw, Trophy } from 'lucide-react';
import { Login } from './components/Login';
import { Game } from './components/Game';
import { Button } from './components/Button';
import { Dashboard } from './components/Dashboard';
import { ScreenState } from './types';

function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LOGIN);
  const [finalScore, setFinalScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/session', { credentials: 'same-origin' });
        const payload = await response.json();
        if (response.ok && payload.authenticated && payload.playerName) {
          setPlayerName(payload.playerName);
          setScreen(ScreenState.DASHBOARD);
        }
      } catch {
        setScreen(ScreenState.LOGIN);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void checkSession();
  }, []);

  const handleLoginSuccess = (name: string) => {
    setPlayerName(name);
    setScreen(ScreenState.DASHBOARD);
  };

  const handleGameOver = async (won: boolean, score: number) => {
    setFinalScore(score);
    setScreen(won ? ScreenState.VICTORY : ScreenState.GAME_OVER);

    try {
      await fetch('/api/scores', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, won }),
      });
    } catch {
      // The game result still renders even if the network is unavailable.
    }
  };

  const resetGame = () => {
    setScreen(ScreenState.PLAYING);
  };

  const showDashboard = () => {
    setScreen(ScreenState.DASHBOARD);
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch(() => undefined);
    setPlayerName('');
    setScreen(ScreenState.LOGIN);
  };

  const getFeedbackMessage = (score: number, won: boolean) => {
    if (won) return "Héroe de la fe: Lograste enviarlo a las 3:59 PM, el cuatrimestre está a salvo... por ahora.";
    
    if (score === 0) return "Le cayó agua al botón de Enter justo al iniciar.";
    if (score < 300) return "Una banda de atracadores entró y se robó SOLAMENTE el cargador de tu laptop.";
    if (score < 600) return "Tu padrastro estaba en la selva de Colombia y te estresaste demasiado.";
    if (score < 900) return "Quisiste ser un héroe de la fe, terminaste en 0 pero lo intentaste.";
    return "El sistema colapsó porque todos subieron la tarea al mismo tiempo.";
  };

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col">
      <nav className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center z-50">
        <div className="font-arcade text-retro-accent text-lg flex items-center gap-2">
          <BookOpenCheck size={24} />
          <span>PPT ATTACK</span>
        </div>
        {screen !== ScreenState.LOGIN && !isCheckingSession && (
          <div className="flex items-center gap-4">
            {screen !== ScreenState.DASHBOARD && (
              <button
                onClick={showDashboard}
                className="text-xs text-gray-400 hover:text-white font-sans inline-flex items-center gap-1"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
            )}
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

      <main className="flex-grow relative overflow-hidden flex items-center justify-center">
        {isCheckingSession && (
          <div className="font-arcade text-retro-accent animate-pulse">Cargando...</div>
        )}
        
        {!isCheckingSession && screen === ScreenState.LOGIN && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}

        {!isCheckingSession && screen === ScreenState.DASHBOARD && (
          <Dashboard playerName={playerName} onPlay={resetGame} />
        )}

        {!isCheckingSession && screen === ScreenState.PLAYING && (
          <Game onGameOver={handleGameOver} />
        )}

        {!isCheckingSession && screen === ScreenState.GAME_OVER && (
          <div className="text-center p-8 bg-slate-800 border-4 border-red-600 rounded-lg shadow-2xl max-w-lg mx-4 z-50 animate-bounce">
            <h1 className="text-4xl font-arcade text-red-500 mb-4">¡REPROBADO!</h1>
            <p className="font-sans text-gray-300 mb-6 text-xl">
              {getFeedbackMessage(finalScore, false)}
            </p>
            <div className="font-arcade text-yellow-400 mb-8">Puntaje Final: {finalScore}</div>
            <div className="flex gap-4 justify-center">
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
    </div>
  );
}

export default App;
