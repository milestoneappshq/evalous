"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type GameState = 'start' | 'showing' | 'playing' | 'failed' | 'saving';

export default function SequenceMemory({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNextLevel = useCallback((currentSequence: number[]) => {
    const nextTile = Math.floor(Math.random() * 9);
    const newSequence = [...currentSequence, nextTile];
    setSequence(newSequence);
    setGameState('showing');
    setUserIndex(0);
    
    // Play sequence
    let i = 0;
    const play = () => {
      if (i < newSequence.length) {
        setActiveTile(newSequence[i]);
        setTimeout(() => {
          setActiveTile(null);
          i++;
          timerRef.current = setTimeout(play, 300);
        }, 500);
      } else {
        setGameState('playing');
      }
    };
    
    timerRef.current = setTimeout(play, 500);
  }, []);

  const handleStart = () => {
    setScore(0);
    setLevel(1);
    startNextLevel([]);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;

    if (index === sequence[userIndex]) {
      // Correct
      setActiveTile(index);
      setTimeout(() => setActiveTile(null), 200);
      
      const nextIndex = userIndex + 1;
      if (nextIndex === sequence.length) {
        // Level complete
        setScore(sequence.length);
        setLevel(prev => prev + 1);
        setTimeout(() => startNextLevel(sequence), 500);
      } else {
        setUserIndex(nextIndex);
      }
    } else {
      // Wrong
      setGameState('failed');
      if (score > highScore) setHighScore(score);
      if (orgId) {
        saveResults(score);
      }
    }
  };

  const saveResults = async (finalScore: number) => {
    setGameState('saving');
    await saveTestResult('sequence-memory', finalScore, { level: level }, orgId || "demo-org");
    setGameState('failed');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Sequence Memory</h2>
        <p className="text-slate-400">Remember an increasingly long pattern of button presses.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Score Overlay */}
        <div className="absolute top-4 right-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
          Level <span className="text-white ml-2 text-xl font-black">{level}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 w-64 h-64 md:w-80 md:h-80 mx-auto mt-4">
          {[...Array(9)].map((_, i) => (
            <motion.button
              key={i}
              whileHover={gameState === 'playing' ? { scale: 1.05 } : {}}
              whileTap={gameState === 'playing' ? { scale: 0.95 } : {}}
              onClick={() => handleTileClick(i)}
              className={`rounded-2xl transition-all duration-200 border-2 ${
                activeTile === i 
                  ? 'bg-white border-white shadow-[0_0_40px_rgba(255,255,255,0.4)]' 
                  : 'bg-slate-800/40 border-white/5 hover:border-white/20'
              }`}
              disabled={gameState !== 'playing'}
            />
          ))}
        </div>

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10"
            >
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 12h10"/><path d="M12 7v10"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to test your memory?</h3>
              <p className="text-slate-400 mb-8 max-w-xs">Repeat the pattern by clicking the tiles in the correct sequence.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl transition-all">
                Start Assessment
              </button>
            </motion.div>
          )}

          {gameState === 'failed' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10"
            >
              <h3 className="text-3xl font-black text-white mb-2">Session Terminated</h3>
              <p className="text-red-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Sequence Broken at Level {level}</p>
              <div className="text-6xl font-black text-white mb-8 border-b-4 border-white/10 pb-4 w-full">
                {score}
              </div>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">
                Try Again
              </button>
            </motion.div>
          )}

          {gameState === 'saving' && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-20"
             >
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-slate-300 font-medium">Archiving Score...</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SEO Content Placeholder */}
      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-400">About the Sequence Memory Test</h4>
        <p className="text-xs leading-relaxed text-slate-400">
          The Sequence Memory test measures working memory capacity and visual-spatial processing. 
          By requiring the brain to encode, maintain, and retrieve a growing temporal sequence, 
          it activates the prefrontal cortex and hippocampus.
        </p>
      </div>
    </div>
  );
}

