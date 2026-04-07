"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type GameState = 'start' | 'showing' | 'playing' | 'failed' | 'success' | 'saving';

export default function VisualMemory({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gridSize, setGridSize] = useState(3);
  const [level, setLevel] = useState(1);
  const [correctTiles, setCorrectTiles] = useState<number[]>([]);
  const [userTiles, setUserTiles] = useState<number[]>([]);
  const [lifes, setLifes] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const generateLevel = useCallback((l: number) => {
    let size = 3;
    if (l > 2) size = 4;
    if (l > 5) size = 5;
    if (l > 10) size = 6;
    if (l > 16) size = 7;
    if (l > 24) size = 8;
    
    setGridSize(size);
    const tileCount = l + 2;
    const allPositions = Array.from({ length: size * size }, (_, i) => i);
    const selected = allPositions.sort(() => Math.random() - 0.5).slice(0, tileCount);
    
    setCorrectTiles(selected);
    setUserTiles([]);
    setGameState('showing');
    
    setTimeout(() => {
      setGameState('playing');
    }, 2000);
  }, []);

  const handleStart = () => {
    setLevel(1);
    setLifes(3);
    generateLevel(1);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (userTiles.includes(index)) return;

    if (correctTiles.includes(index)) {
      const newUserTiles = [...userTiles, index];
      setUserTiles(newUserTiles);
      
      if (newUserTiles.length === correctTiles.length) {
        setGameState('success');
        setLevel(prev => prev + 1);
        setTimeout(() => generateLevel(level + 1), 1000);
      }
    } else {
      // Wrong
      const newLifes = lifes - 1;
      setLifes(newLifes);
      if (newLifes <= 0) {
        setGameState('failed');
        if (orgId) saveResults(level);
      } else {
        setGameState('showing');
        setTimeout(() => setGameState('playing'), 1000);
      }
    }
  };

  const saveResults = async (finalScore: number) => {
    setIsSaving(true);
    await saveTestResult('visual-memory', finalScore, { level: finalScore }, orgId || "demo-org");
    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Visual Memory</h2>
        <p className="text-slate-400">Remember an increasingly large pattern of squares.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-xl">
        
        <div 
          className="grid gap-3" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {[...Array(gridSize * gridSize)].map((_, i) => {
            const isCorrect = correctTiles.includes(i);
            const isUserSelected = userTiles.includes(i);
            
            return (
              <motion.button
                key={i}
                whileHover={gameState === 'playing' ? { scale: 1.05 } : {}}
                whileTap={gameState === 'playing' ? { scale: 0.95 } : {}}
                onClick={() => handleTileClick(i)}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all duration-300 ${
                  (gameState === 'showing' || gameState === 'success') && isCorrect
                    ? 'bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    : isUserSelected
                      ? 'bg-white border-white'
                      : 'bg-slate-800/40 border-white/5'
                }`}
                disabled={gameState !== 'playing'}
              />
            );
          })}
        </div>

        <div className="mt-8 flex gap-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className={`w-3 h-3 rounded-full ${i < lifes ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />
           ))}
        </div>

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">👁️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Visual Spatial Processing</h3>
              <p className="text-slate-400 mb-8 max-w-xs">A measure of iconographic memory and pattern recognition efficiency.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl">Start Assessment</button>
            </motion.div>
          )}

          {gameState === 'failed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <h3 className="text-3xl font-black text-white mb-2">Memory Capacity Reached</h3>
              <p className="text-red-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Spatial precision threshold hit at level {level}.</p>
              <div className="text-6xl font-black text-white mb-8 border-b-4 border-white/10 pb-4 w-full">{level}</div>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold transition-all shadow-xl">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-500">Science of Visual Memory</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           Measures the capacity of the visual-spatial sketchpad, a component of the working memory system.
           It correlates strongly with performance in engineering, complex data analysis, and architectural tasks.
        </p>
      </div>
    </div>
  );
}
