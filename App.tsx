
import React, { useState, useEffect } from 'react';
import MarioGame from './components/MarioGame';

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) setHighScore(newScore);
  };

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 p-8 md:p-10 rounded-3xl border border-indigo-500 shadow-2xl text-center w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl flex items-center justify-center font-pixel text-3xl md:text-4xl shadow-lg shadow-indigo-500/20 mx-auto mb-6">W</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">Hunter's Mark</h2>
          <p className="text-slate-400 mb-8 text-xs md:text-sm leading-relaxed">
            Exploration requires an authorized hunters mark. Connect your project to begin the hunt.
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-indigo-400 mt-4 underline font-semibold hover:text-indigo-300 transition-colors"
            >
              Billing Documentation
            </a>
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/30 transform active:scale-95"
          >
            Authorize Hunt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 overflow-x-hidden">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-start">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-pixel text-xl shadow-lg shadow-indigo-500/20">W</div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">WOLF <span className="text-indigo-500">LEGACY</span></h1>
            <p className="hidden md:block text-[10px] text-slate-500 uppercase tracking-widest">Multi-Level Challenge</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8 bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-700/50">
          <div className="text-center">
            <p className="text-[8px] md:text-[10px] text-slate-500 font-pixel">LVL</p>
            <p className="text-sm md:text-xl font-pixel text-indigo-400">{currentLevel}</p>
          </div>
          <div className="h-6 w-[1px] bg-slate-700"></div>
          <div className="text-center">
            <p className="text-[8px] md:text-[10px] text-slate-500 font-pixel">SCORE</p>
            <p className="text-sm md:text-xl font-pixel text-yellow-400">{score.toString().padStart(5, '0')}</p>
          </div>
          <div className="h-6 w-[1px] bg-slate-700"></div>
          <div className="text-center">
            <p className="text-[8px] md:text-[10px] text-slate-500 font-pixel">MAX</p>
            <p className="text-sm md:text-xl font-pixel text-slate-100">{highScore.toString().padStart(5, '0')}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <MarioGame 
            onScoreUpdate={handleScoreUpdate} 
            onLevelUpdate={setCurrentLevel}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-center backdrop-blur-sm">
              <span className="block text-[10px] md:text-xs text-indigo-500 font-bold mb-1 uppercase tracking-widest">Controls</span>
              <p className="text-[10px] md:text-xs text-slate-400 font-pixel leading-relaxed">WASD / TOUCH OVERLAY</p>
            </div>
            <div className="p-3 md:p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-center backdrop-blur-sm">
              <span className="block text-[10px] md:text-xs text-yellow-500 font-bold mb-1 uppercase tracking-widest">Journey</span>
              <p className="text-[10px] md:text-xs text-slate-400 font-pixel leading-relaxed">COLLECT COINS TO ADVANCE</p>
            </div>
            <div className="p-3 md:p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-center backdrop-blur-sm">
              <span className="block text-[10px] md:text-xs text-red-500 font-bold mb-1 uppercase tracking-widest">Challenge</span>
              <p className="text-[10px] md:text-xs text-slate-400 font-pixel leading-relaxed">STOMP ENEMIES FOR BONUS</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 px-6 py-4 text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-2">
        <span>© 2024 Wolf World Studios</span>
        <div className="flex gap-4">
            <span className="text-indigo-400">Stable Build v2.1 Mobile</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline">Adaptive Engine</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
