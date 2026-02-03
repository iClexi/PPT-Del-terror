import React, { useState } from 'react';
import { Login } from './components/Login';
import { Game } from './components/Game';
import { Button } from './components/Button';
import { ScreenState } from './types';

function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LOGIN);
  const [finalScore, setFinalScore] = useState(0);

  const handleLoginSuccess = () => {
    setScreen(ScreenState.PLAYING);
  };

  const handleGameOver = (won: boolean, score: number) => {
    setFinalScore(score);
    setScreen(won ? ScreenState.VICTORY : ScreenState.GAME_OVER);
  };

  const resetGame = () => {
    setScreen(ScreenState.PLAYING);
  };

  const logout = () => {
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
      {/* Header / Navbar */}
      <nav className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center z-50">
        <div className="font-arcade text-retro-accent text-lg flex items-center gap-2">
          <span>💀</span> PPT ATTACK
        </div>
        {screen !== ScreenState.LOGIN && (
          <button 
            onClick={logout} 
            className="text-xs text-gray-400 hover:text-white underline font-sans"
          >
            Cerrar Sesión
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow relative overflow-hidden flex items-center justify-center">
        
        {screen === ScreenState.LOGIN && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}

        {screen === ScreenState.PLAYING && (
          <Game onGameOver={handleGameOver} />
        )}

        {screen === ScreenState.GAME_OVER && (
          <div className="text-center p-8 bg-slate-800 border-4 border-red-600 rounded-lg shadow-2xl max-w-lg mx-4 z-50 animate-bounce">
            <h1 className="text-4xl font-arcade text-red-500 mb-4">¡REPROBADO!</h1>
            <p className="font-sans text-gray-300 mb-6 text-xl">
              {getFeedbackMessage(finalScore, false)}
            </p>
            <div className="font-arcade text-yellow-400 mb-8">Puntaje Final: {finalScore}</div>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="primary">Intentar de nuevo</Button>
            </div>
          </div>
        )}

        {screen === ScreenState.VICTORY && (
          <div className="text-center p-8 bg-slate-800 border-4 border-green-500 rounded-lg shadow-2xl max-w-lg mx-4 z-50">
            <h1 className="text-3xl font-arcade text-green-400 mb-4">¡PPT SUBIDO!</h1>
            <p className="font-sans text-gray-300 mb-6 text-xl">
              {getFeedbackMessage(finalScore, true)}
            </p>
            <div className="font-arcade text-yellow-400 mb-8">Puntaje Final: {finalScore}</div>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="success">Jugar otra vez</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;