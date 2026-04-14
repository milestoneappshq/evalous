"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type GameState = 'start' | 'showing' | 'hidden' | 'failed' | 'success' | 'saving';

export default function ChimpTest({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [grid, setGrid] = useState<(number | null)[]>(new Array(40).fill(null));
  const [numbersCount, setNumbersCount] = useState(4);
  const [nextExpected, setNextExpected] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const generateGrid = useCallback((count: number) => {
    const newGrid = new Array(40).fill(null);
    const positions = Array.from({ length: 40 }, (_, i) => i);
    const selectedPositions = positions.sort(() => Math.random() - 0.5).slice(0, count);
    
    selectedPositions.forEach((pos, i) => {
      newGrid[pos] = i + 1;
    });
    
    setGrid(newGrid);
    setNextExpected(1);
    setGameState('showing');
  }, []);

  const handleStart = () => {
    setNumbersCount(4);
    generateGrid(4);
  };

  const handleTileClick = (val: number | null) => {
    if (gameState !== 'showing' && gameState !== 'hidden') return;
    if (val === null) return;

    if (val === nextExpected) {
      if (val === 1) setGameState('hidden');
      
      const newGrid = [...grid];
      newGrid[grid.indexOf(val)] = null;
      setGrid(newGrid);

      if (val === numbersCount) {
        // Round Success
        setGameState('success');
        setNumbersCount(prev => prev + 1);
      } else {
        setNextExpected(val + 1);
      }
    } else {
      // Failed
      setGameState('failed');
      if (orgId) {
        saveResults(numbersCount);
      }
    }
  };

  const saveResults = async (finalScore: number) => {
    setIsSaving(true);
    await saveTestResult('chimp-test', finalScore, { numbers: finalScore }, orgId || "demo-org");
    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Are you smarter than a chimpanzee?</h2>
        <p className="text-slate-400">Click the squares in order. Numbers disappear after the first click.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl">
        
        <div className="grid grid-cols-5 md:grid-cols-8 gap-3">
          {grid.map((val, i) => (
            <motion.button
              key={i}
              whileHover={val ? { scale: 1.05, borderColor: "rgba(255,255,255,0.4)" } : {}}
              whileTap={val ? { scale: 0.95 } : {}}
              onClick={() => handleTileClick(val)}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-300 font-black text-xl md:text-2xl ${
                val 
                  ? 'border-white/10 bg-slate-800/40 text-white hover:bg-slate-800' 
                  : 'border-transparent bg-transparent pointer-events-none'
              }`}
            >
              <span className={gameState === 'hidden' && val ? 'opacity-0' : 'opacity-100'}>
                {val}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">🍌</div>
              <h3 className="text-2xl font-bold text-white mb-2">Chimpanzee Working Memory</h3>
              <p className="text-slate-400 mb-8 max-w-xs">Humans rarely score above 10, while chimpanzees consistently hit 15+.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-bold shadow-xl transition-all">Begin Evaluation</button>
            </motion.div>
          )}

          {gameState === 'failed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <h3 className="text-3xl font-black text-white mb-2">Cognitive Threshold Met</h3>
              <p className="text-red-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Inability to encode more than {numbersCount} discrete items.</p>
              <div className="text-6xl font-black text-white mb-8 border-b-4 border-white/10 pb-4 w-full">{numbersCount}</div>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">Retry Baseline</button>
            </motion.div>
          )}

          {gameState === 'success' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
               <h3 className="text-4xl font-black text-white mb-4">Baseline Increased</h3>
               <p className="text-emerald-200/60 mb-8 tracking-widest uppercase text-xs font-bold">Successfully encoded {numbersCount-1} units.</p>
               <button onClick={() => generateGrid(numbersCount)} className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black tracking-widest uppercase text-sm shadow-xl transition-all">Advance Next Protocol</button>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-400">Biological Basis: Chimp Test</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           The "Chimpanzee Test" is a standardized working memory assessment originally used by researchers at Kyoto University.
           It demonstrates the trade-off between conceptual generalization (human language) and high-fidelity short-term visual persistence (primate memory).
        </p>
      </div>
    </div>
  );
}

